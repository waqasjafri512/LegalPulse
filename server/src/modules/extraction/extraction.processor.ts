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
      const aiData = await this.extractionService.processWithAI(contract.file_url, mimetype);
      if (!aiData) {
        throw new Error('AI extraction returned no data');
      }

      this.logger.log(`AI extraction returned fields: ${Object.keys(aiData).join(', ')}`);

      // 4. Generate Embedding for Semantic Search
      const textToEmbed = `${contract.title} ${aiData.counterparty_name || ''} ${aiData.summary || ''}`;
      const embedding = await this.extractionService.generateEmbedding(textToEmbed);

      // 5. Map ONLY known entity fields from AI data (avoid spreading unknown fields)
      const updateData: Partial<Contract> = {
        status: 'completed',
        ai_extraction_raw: aiData,
      };

      // Map each known field safely
      if (aiData.contract_type) updateData.contract_type = String(aiData.contract_type);
      if (aiData.counterparty_name) updateData.counterparty_name = String(aiData.counterparty_name);
      if (aiData.governing_law) updateData.governing_law = String(aiData.governing_law);
      if (aiData.liability_cap) updateData.liability_cap = String(aiData.liability_cap);
      if (aiData.indemnification_party) updateData.indemnification_party = String(aiData.indemnification_party);
      if (aiData.payment_terms) updateData.payment_terms = String(aiData.payment_terms);
      if (aiData.auto_renewal_terms) updateData.auto_renewal_terms = String(aiData.auto_renewal_terms);
      if (aiData.summary) updateData.summary = String(aiData.summary);
      if (aiData.summary) updateData.notes = String(aiData.summary); // Also save to notes

      // Numeric fields
      if (aiData.contract_value != null && !isNaN(Number(aiData.contract_value))) {
        updateData.contract_value = Number(aiData.contract_value);
      }
      if (aiData.termination_notice_days != null && !isNaN(Number(aiData.termination_notice_days))) {
        updateData.termination_notice_days = Number(aiData.termination_notice_days);
      }
      if (aiData.risk_score != null && !isNaN(Number(aiData.risk_score))) {
        updateData.risk_score = Number(aiData.risk_score);
      }

      // Boolean fields
      if (aiData.auto_renewal != null) {
        updateData.auto_renewal = Boolean(aiData.auto_renewal);
      }
      if (aiData.termination_for_convenience != null) {
        updateData.termination_for_convenience = Boolean(aiData.termination_for_convenience);
      }

      // Date fields — parse safely
      if (aiData.effective_date) {
        const parsed = new Date(aiData.effective_date);
        if (!isNaN(parsed.getTime())) updateData.effective_date = parsed;
      }
      if (aiData.expiration_date) {
        const parsed = new Date(aiData.expiration_date);
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
