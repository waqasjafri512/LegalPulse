import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Logger, Inject, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Contract } from '../contracts/entities/contract.entity';
import { ExtractionService } from './extraction.service';
import { AlertsService } from '../alerts/alerts.service';

@Processor('extraction')
export class ExtractionProcessor extends WorkerHost {
  private readonly logger = new Logger(ExtractionProcessor.name);

  constructor(
    @InjectRepository(Contract)
    private readonly contractRepository: Repository<Contract>,
    private readonly extractionService: ExtractionService,
    @Inject(forwardRef(() => AlertsService))
    private readonly alertsService: AlertsService,
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

      // 2. Determine mimetype — prefer stored mimetype, fallback to inference from title
      let mimetype = contract.file_mimetype;
      if (!mimetype) {
        const title = (contract.title || contract.file_url || '').toLowerCase();
        if (title.endsWith('.pdf')) {
          mimetype = 'application/pdf';
        } else if (title.endsWith('.docx')) {
          mimetype = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
        } else if (title.endsWith('.doc')) {
          mimetype = 'application/msword';
        } else {
          // Default to PDF as most common
          mimetype = 'application/pdf';
        }
        this.logger.warn(`No stored mimetype for ${contractId}, inferred: ${mimetype}`);
      }

      this.logger.log(`Processing ${contract.title} with mimetype: ${mimetype}`);

      // 3. Process with AI (Extraction)
      const aiResponse = await this.extractionService.processWithAI(contract.file_url, mimetype);
      if (!aiResponse || !aiResponse.extraction) {
        throw new Error('AI extraction returned no data');
      }

      const { extraction, fullText } = aiResponse;
      this.logger.log(`AI extraction returned fields: ${Object.keys(extraction).join(', ')}`);

      // 4. Generate Embedding for Semantic Search
      const textToEmbed = `${contract.title} ${extraction.counterparty_name || ''} ${extraction.summary || ''}`;
      const embedding = await this.extractionService.generateEmbedding(textToEmbed);
 
      // 5. Map ONLY known entity fields from AI data (avoid spreading unknown fields)
      const updateData: Partial<Contract> = {
        status: 'completed',
        ai_extraction_raw: extraction,
        full_text: fullText,
      };
 
      // Map each known field safely
      if (extraction.contract_type && contract.contract_type !== 'Matter Document') {
        updateData.contract_type = String(extraction.contract_type);
      }
      if (extraction.counterparty_name) updateData.counterparty_name = String(extraction.counterparty_name);
      if (extraction.governing_law) updateData.governing_law = String(extraction.governing_law);
      if (extraction.liability_cap) updateData.liability_cap = String(extraction.liability_cap);
      if (extraction.indemnification_party) updateData.indemnification_party = String(extraction.indemnification_party);
      if (extraction.payment_terms) updateData.payment_terms = String(extraction.payment_terms);
      if (extraction.auto_renewal_terms) updateData.auto_renewal_terms = String(extraction.auto_renewal_terms);
      if (extraction.summary) updateData.summary = String(extraction.summary);
      if (extraction.summary) updateData.notes = String(extraction.summary); // Also save to notes
 
      // Numeric fields
      if (extraction.contract_value != null && !isNaN(Number(extraction.contract_value))) {
        updateData.contract_value = Number(extraction.contract_value);
      }
      if (extraction.termination_notice_days != null && !isNaN(Number(extraction.termination_notice_days))) {
        updateData.termination_notice_days = Number(extraction.termination_notice_days);
      }
      if (extraction.risk_score != null && !isNaN(Number(extraction.risk_score))) {
        updateData.risk_score = Number(extraction.risk_score);
      }
 
      // Boolean fields
      if (extraction.auto_renewal != null) {
        updateData.auto_renewal = Boolean(extraction.auto_renewal);
      }
      if (extraction.termination_for_convenience != null) {
        updateData.termination_for_convenience = Boolean(extraction.termination_for_convenience);
      }
 
      // Date fields — parse safely
      if (extraction.effective_date) {
        const parsed = new Date(extraction.effective_date);
        if (!isNaN(parsed.getTime())) updateData.effective_date = parsed;
      }
      if (extraction.expiration_date) {
        const parsed = new Date(extraction.expiration_date);
        if (!isNaN(parsed.getTime())) updateData.expiration_date = parsed;
      }

      // Embedding
      if (embedding) {
        updateData.embedding = JSON.stringify(embedding);
      }

      // 6. Update contract record
      this.logger.log(`Updating contract ${contractId} with ${Object.keys(updateData).length} fields`);
      await this.contractRepository.update(contractId, updateData);

      this.logger.log(`✅ Successfully processed contract: ${contractId}`);

      // 7. Trigger Alerts generation for this org automatically
      try {
        await this.alertsService.generateAlertsForOrg(contract.org_id);
        this.logger.log(`📢 Alerts scanned for org: ${contract.org_id}`);
      } catch (err) {
        this.logger.error(`❌ Failed to generate alerts: ${err.message}`);
      }

      return { success: true };
    } catch (error) {
      this.logger.error(`❌ Failed to process contract ${contractId}: ${error.message}`);
      
      // Update status to error
      await this.contractRepository.update(contractId, { status: 'error' });
      
      throw error;
    }
  }
}
