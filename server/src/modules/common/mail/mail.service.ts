import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';

@Injectable()
export class MailService {
  private resend: Resend;
  private readonly logger = new Logger(MailService.name);

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>('RESEND_API_KEY');
    if (apiKey) {
      this.resend = new Resend(apiKey);
    } else {
      this.logger.warn('RESEND_API_KEY is not set. Email notifications will be skipped.');
    }
  }

  async sendEmail(to: string, subject: string, html: string) {
    if (!this.resend) {
      this.logger.warn(`Skipping email to ${to} (Resend not configured)`);
      return;
    }

    try {
      this.logger.log(`Sending email to ${to}: ${subject}`);
      const data = await this.resend.emails.send({
        from: 'LegalPulse <alerts@legalpulse.ai>', // Replace with your verified domain
        to,
        subject,
        html,
      });
      return data;
    } catch (error) {
      this.logger.error(`Failed to send email to ${to}: ${error.message}`);
      throw error;
    }
  }

  async sendExpirationAlert(to: string, contractName: string, expirationDate: string) {
    const subject = `Urgent: Contract Expiring - ${contractName}`;
    const html = `
      <div style="font-family: sans-serif; color: #1e293b; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #6366f1;">LegalPulse Alert</h2>
        <p>Hello,</p>
        <p>This is an automated notification that the following contract is set to expire soon:</p>
        <div style="padding: 16px; background: #f8fafc; border-radius: 8px; border: 1px solid #e2e8f0;">
          <strong>Contract:</strong> ${contractName}<br>
          <strong>Expiration Date:</strong> ${expirationDate}
        </div>
        <p>Please log in to your dashboard to review and take action.</p>
        <a href="https://legalpulse.ai/dashboard" style="display: inline-block; padding: 12px 24px; background: #6366f1; color: white; text-decoration: none; border-radius: 6px; font-weight: bold; margin-top: 16px;">
          View Dashboard
        </a>
        <hr style="margin: 24px 0; border: none; border-top: 1px solid #e2e8f0;">
        <p style="font-size: 12px; color: #64748b;">
          &copy; 2026 LegalPulse AI. All rights reserved.
        </p>
      </div>
    `;
    return this.sendEmail(to, subject, html);
  }
}
