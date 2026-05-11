import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { WebClient } from '@slack/web-api';

@Injectable()
export class SlackService {
  private slackClient: WebClient;
  private readonly logger = new Logger(SlackService.name);

  constructor(private configService: ConfigService) {
    const token = this.configService.get<string>('SLACK_BOT_TOKEN');
    if (token) {
      this.slackClient = new WebClient(token);
    } else {
      this.logger.warn('SLACK_BOT_TOKEN is not set. Slack notifications will be skipped.');
    }
  }

  async sendMessage(channel: string, text: string, blocks?: any[]) {
    if (!this.slackClient) {
      this.logger.warn(`Skipping Slack message to ${channel} (Token not set)`);
      return;
    }

    try {
      this.logger.log(`Sending Slack message to ${channel}`);
      await this.slackClient.chat.postMessage({
        channel,
        text,
        blocks,
      });
    } catch (error) {
      this.logger.error(`Failed to send Slack message: ${error.message}`);
    }
  }

  async sendExpirationAlert(channel: string, contractName: string, expirationDate: string, url: string) {
    const blocks = [
      {
        type: 'header',
        text: {
          type: 'plain_text',
          text: '🚨 LegalPulse Contract Alert',
          emoji: true,
        },
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `*Contract Expiring Soon*\n*Name:* ${contractName}\n*Expiration Date:* ${expirationDate}`,
        },
      },
      {
        type: 'actions',
        elements: [
          {
            type: 'button',
            text: {
              type: 'plain_text',
              text: 'View Contract',
              emoji: true,
            },
            url,
            style: 'primary',
          },
        ],
      },
    ];

    await this.sendMessage(channel, `Contract Expiring: ${contractName}`, blocks);
  }
}
