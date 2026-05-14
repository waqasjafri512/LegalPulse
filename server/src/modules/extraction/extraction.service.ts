import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class ExtractionService {
  private readonly logger = new Logger(ExtractionService.name);
  private readonly aiServiceUrl = process.env.AI_SERVICE_URL || 'http://localhost:3001';

  async processWithAI(fileUrl: string, mimetype: string): Promise<any> {
    try {
      this.logger.log(`Calling AI Service for extraction: ${fileUrl.substring(0, 80)}...`);
      this.logger.log(`AI Service URL: ${this.aiServiceUrl}/extract`);
      
      const response = await axios.post(
        `${this.aiServiceUrl}/extract`,
        { fileUrl, mimetype },
        { timeout: 120000 } // 2 minute timeout for large files
      );

      return response.data;
    } catch (error: any) {
      this.logger.error(
        `AI Service extraction failed: ${error?.response?.data?.error || error.message}`,
      );
      return null;
    }
  }

  async generateEmbedding(text: string): Promise<number[] | null> {
    try {
      this.logger.log(`Calling AI Service for embedding...`);
      
      const response = await axios.post(
        `${this.aiServiceUrl}/embed`,
        { text },
        { timeout: 30000 }
      );

      if (response.data.skipped) {
        this.logger.warn('Embedding was skipped (no OpenAI key configured)');
        return null;
      }

      return response.data.embedding;
    } catch (error: any) {
      this.logger.error(
        `AI Service embedding failed: ${error?.response?.data?.error || error.message}`,
      );
      return null;
    }
  }
}