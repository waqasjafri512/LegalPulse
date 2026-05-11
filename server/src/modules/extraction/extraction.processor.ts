import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Contract } from '../contracts/entities/contract.entity';
import { ExtractionService } from './extraction.service';

@Processor('extraction')
export class ExtractionProcessor extends WorkerHost {
  private readonly logger = new Logger(ExtractionProcessor.name);

  constructor(
    @InjectRepository(Contract)
    private readonly contractRepository: Repository<Contract>,
    private readonly extractionService: ExtractionService,
  ) {
    super();
  }

  async process(job: Job<any, any, string>): Promise<any> {
    const { contractId } = job.data;
    this.logger.log(`Processing extraction for contract: ${contractId}`);

    try {
      // 1. Get contract record
      const contract = await this.contractRepository.findOne({ where: { id: contractId } });
      if (!contract) {
        throw new Error(`Contract ${contractId} not found`);
      }

      // 2. Download file
      this.logger.log(`Fetching buffer for ${contract.file_url}`);
      const buffer = await this.extractionService.fetchFileBuffer(contract.file_url);

      // 3. Extract text
      // Note: We need the mimetype. For now, we'll infer from the filename or URL
      const mimetype = contract.file_url.endsWith('.pdf') ? 'application/pdf' : 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
      const text = await this.extractionService.extractText(buffer, mimetype);

      // 4. Process with AI
      const aiData = await this.extractionService.processWithAI(text);
      if (!aiData) {
        throw new Error('AI processing returned no data');
      }

      // 5. Update contract record
      this.logger.log(`Updating contract ${contractId} with AI data`);
      
      const updatedData = {
        ...contract,
        ...aiData,
        status: 'completed',
        ai_extraction_raw: aiData,
        // Map AI fields to entity fields if they differ
        notes: aiData.summary,
      };

      await this.contractRepository.save(updatedData);

      this.logger.log(`Successfully processed contract: ${contractId}`);
      return { success: true };
    } catch (error) {
      this.logger.error(`Failed to process contract ${contractId}: ${error.message}`);
      
      // Update status to error
      await this.contractRepository.update(contractId, { status: 'error' });
      
      throw error;
    }
  }
}
