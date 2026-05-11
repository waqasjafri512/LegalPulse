import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { Contract } from './entities/contract.entity';
import { CloudinaryService } from '../../common/cloudinary/cloudinary.service';

@Injectable()
export class ContractsService {
  private readonly logger = new Logger(ContractsService.name);

  constructor(
    @InjectRepository(Contract)
    private readonly contractRepository: Repository<Contract>,
    private readonly cloudinaryService: CloudinaryService,
    @InjectQueue('extraction') private readonly extractionQueue: Queue,
  ) {}

  async uploadContract(file: Express.Multer.File, orgId: string, userId: string) {
    try {
      this.logger.log(`Uploading contract for org: ${orgId}`);

      // 0. Check for duplicates (simple check by filename and size)
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
        file_url: uploadResult.secure_url,
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
    const qb = this.contractRepository.createQueryBuilder('contract');
    
    qb.where('contract.org_id = :orgId', { orgId });
    
    if (query) {
      qb.andWhere(
        '(contract.title ILIKE :query OR contract.counterparty_name ILIKE :query OR contract.summary ILIKE :query)',
        { query: `%${query}%` }
      );
    }
    
    return qb.orderBy('contract.created_at', 'DESC').getMany();
  }
}
