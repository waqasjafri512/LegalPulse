import { Injectable, Logger } from '@nestjs/common';
import mammoth from 'mammoth';
import axios from 'axios';

@Injectable()
export class ExtractionService {
  private readonly logger = new Logger(ExtractionService.name);

  async extractText(buffer: Buffer, mimetype: string): Promise<string> {
    try {
      // 📄 PDF HANDLING (FIXED FOR ESM/CJS MISMATCH)
      if (mimetype === 'application/pdf') {
        const pdfModule = await import('pdf-parse');

        // Safe fallback for both export styles
        const pdf =
          (pdfModule as any).default || (pdfModule as any);

        const data = await pdf(buffer);
        return data.text;
      }

      // 📝 DOCX / DOC HANDLING
      if (
        mimetype ===
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
        mimetype === 'application/msword'
      ) {
        const result = await mammoth.extractRawText({ buffer });
        return result.value;
      }

      throw new Error(`Unsupported mimetype: ${mimetype}`);
    } catch (error: any) {
      this.logger.error(
        `Text extraction failed: ${error?.message || error}`,
      );
      throw error;
    }
  }

  async processWithAI(text: string): Promise<any> {
    const grokApiKey = process.env.GROK_API_KEY;

    if (!grokApiKey) {
      this.logger.warn('GROK_API_KEY is missing, skipping AI extraction');
      return null;
    }

    const prompt = `
You are a specialized legal AI assistant. Extract key contract terms.

Return ONLY JSON with:
- contract_type
- classification_confidence
- counterparty_name
- effective_date
- expiration_date
- auto_renewal
- governing_law
- contract_value
- liability_cap
- termination_notice_days
- extraction_confidence
- summary
- key_risks (max 3)

Contract Text:
${text.substring(0, 30000)}
`;

    try {
      const response = await axios.post(
        'https://api.grok.com/v1/chat/completions',
        {
          model: 'grok-1',
          messages: [{ role: 'user', content: prompt }],
          temperature: 0,
          response_format: { type: 'json_object' },
        },
        {
          headers: {
            Authorization: `Bearer ${grokApiKey}`,
            'Content-Type': 'application/json',
          },
        },
      );

      return JSON.parse(response.data.choices[0].message.content);
    } catch (error: any) {
      this.logger.error(
        `AI processing failed: ${error?.message || error}`,
      );
      return null;
    }
  }

  async fetchFileBuffer(url: string): Promise<Buffer> {
    const response = await axios.get(url, {
      responseType: 'arraybuffer',
    });

    return Buffer.from(response.data);
  }
}