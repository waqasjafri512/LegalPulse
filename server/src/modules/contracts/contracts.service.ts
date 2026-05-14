import { Injectable, Logger, Inject, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { createClerkClient } from '@clerk/backend';
import { Contract } from './entities/contract.entity';
import { CloudinaryService } from '../../common/cloudinary/cloudinary.service';
import { ExtractionService } from '../extraction/extraction.service';
import { AlertsService } from '../alerts/alerts.service';

@Injectable()
export class ContractsService {
  private readonly logger = new Logger(ContractsService.name);

  constructor(
    @InjectRepository(Contract)
    private readonly contractRepository: Repository<Contract>,
    private readonly cloudinaryService: CloudinaryService,
    @Inject(forwardRef(() => ExtractionService))
    private readonly extractionService: ExtractionService,
    private readonly alertsService: AlertsService,
    @InjectQueue('extraction') private readonly extractionQueue: Queue,
  ) {}

  async uploadContract(file: Express.Multer.File, orgId: string, userId: string, documentType?: string) {
    try {
      this.logger.log(`Uploading contract for org: ${orgId}`);

      // 0. Ensure Org exists (Sync with Clerk)
      const orgRepo = this.contractRepository.manager.getRepository('Org');
      let org = await orgRepo.findOne({ where: { id: orgId } });
      if (!org) {
        this.logger.log(`Syncing new organization from Clerk: ${orgId}`);
        try {
          const clerkClient = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });
          const clerkOrg = await clerkClient.organizations.getOrganization({ organizationId: orgId });
          org = orgRepo.create({
            id: orgId,
            name: clerkOrg.name || 'Unknown Organization',
            settings: {},
          });
          await orgRepo.save(org);
        } catch (err) {
          this.logger.error(`Failed to sync organization ${orgId}: ${err.message}`);
          // Fallback creation if Clerk fetch fails
          org = orgRepo.create({ id: orgId, name: 'New Organization', settings: {} });
          await orgRepo.save(org);
        }
      }

      // 0.1 Ensure User exists
      const userRepo = this.contractRepository.manager.getRepository('User');
      let user = await userRepo.findOne({ where: { id: userId } });
      if (!user) {
        this.logger.log(`Creating local user record for: ${userId}`);
        user = userRepo.create({
          id: userId,
          clerk_user_id: userId,
          email: 'user@example.com', // Fallback, would ideally get from token or Clerk
          org_id: orgId,
        });
        await userRepo.save(user);
      }

      // 0.2 Check for duplicates
      const existing = await this.contractRepository.findOne({
        where: {
          title: file.originalname,
          file_size_bytes: file.size,
          org_id: orgId,
        },
      });

      if (existing) {
        this.logger.warn(`Duplicate contract detected: ${file.originalname}`);
        return {
          id: existing.id,
          title: existing.title,
          status: existing.status,
          file_url: existing.file_url,
          is_duplicate: true,
        };
      }

      // 1. Upload to Cloudinary
      const uploadResult = await this.cloudinaryService.uploadFile(file);

      // 2. Create database record
      const contract = this.contractRepository.create({
        title: file.originalname,
        contract_type: documentType || 'Contract',
        file_url: uploadResult.secure_url,
        file_mimetype: file.mimetype,
        file_size_bytes: file.size,
        status: 'processing',
        org_id: orgId,
        owner_id: userId,
      });

      const savedContract = await this.contractRepository.save(contract);

      // 3. Trigger BullMQ job for AI extraction
      await this.extractionQueue.add('extract', { 
        contractId: savedContract.id 
      });

      this.logger.log(`Contract ${savedContract.id} uploaded and queued for extraction`);

      return {
        id: savedContract.id,
        title: savedContract.title,
        status: savedContract.status,
        file_url: savedContract.file_url,
      };
    } catch (error) {
      this.logger.error(`Failed to upload contract: ${error.message}`);
      throw error;
    }
  }

  async findAllByOrg(orgId: string) {
    return this.contractRepository.find({
      where: { org_id: orgId },
      order: { created_at: 'DESC' },
    });
  }

  async findOne(id: string, orgId: string) {
    return this.contractRepository.findOne({
      where: { id, org_id: orgId },
    });
  }

  async search(query: string, orgId: string) {
    if (!query) return this.findAllByOrg(orgId);

    try {
      // 1. Generate embedding for the search query
      const queryEmbedding = await this.extractionService.generateEmbedding(query);

      if (!queryEmbedding) {
        this.logger.warn('Embedding generation failed, falling back to keyword search');
        return this.keywordSearch(query, orgId);
      }

      // 2. Perform Semantic Search using pgvector
      const vectorString = `[${queryEmbedding.join(',')}]`;
      
      const results = await this.contractRepository
        .createQueryBuilder('contract')
        .where('contract.org_id = :orgId', { orgId })
        .addSelect(`(contract.embedding::vector <=> :vectorString)`, 'distance')
        .setParameter('vectorString', vectorString)
        .orderBy('distance', 'ASC')
        .limit(20)
        .getMany();

      return results;
    } catch (error) {
      this.logger.error(`Semantic search failed: ${error.message}`);
      return this.keywordSearch(query, orgId);
    }
  }

  private async keywordSearch(query: string, orgId: string) {
    const qb = this.contractRepository.createQueryBuilder('contract');
    qb.where('contract.org_id = :orgId', { orgId });
    qb.andWhere(
      '(contract.title ILIKE :query OR contract.counterparty_name ILIKE :query OR contract.summary ILIKE :query OR contract.notes ILIKE :query)',
      { query: `%${query}%` }
    );
    return qb.orderBy('contract.created_at', 'DESC').getMany();
  }
  async remove(id: string, orgId: string) {
    const contract = await this.findOne(id, orgId);
    if (!contract) {
      throw new Error('Contract not found');
    }
    await this.contractRepository.remove(contract);
    return { success: true };
  }

  async update(id: string, data: Partial<Contract>, orgId: string) {
    const contract = await this.findOne(id, orgId);
    if (!contract) {
      throw new Error('Contract not found');
    }
    Object.assign(contract, data);
    return this.contractRepository.save(contract);
  }
}
