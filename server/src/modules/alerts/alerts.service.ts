import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThanOrEqual } from 'typeorm';
import { Alert, AlertPriority } from './entities/alert.entity';
import { Contract } from '../contracts/entities/contract.entity';
import { MailService } from '../common/mail/mail.service';
import { User } from '../users/entities/user.entity';
import { SlackService } from '../../common/slack/slack.service';
import { Org } from '../orgs/entities/org.entity';

@Injectable()
export class AlertsService {
  private readonly logger = new Logger(AlertsService.name);

  constructor(
    @InjectRepository(Alert)
    private readonly alertRepository: Repository<Alert>,
    @InjectRepository(Contract)
    private readonly contractRepository: Repository<Contract>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Org)
    private readonly orgRepository: Repository<Org>,
    private readonly mailService: MailService,
    private readonly slackService: SlackService,
  ) {}

  async findAllByOrg(orgId: string) {
    return this.alertRepository.find({
      where: { org_id: orgId },
      order: { created_at: 'DESC' },
    });
  }

  async getUnreadCount(orgId: string) {
    return this.alertRepository.count({
      where: { org_id: orgId, is_read: false },
    });
  }

  async markAsRead(id: string, orgId: string) {
    await this.alertRepository.update({ id, org_id: orgId }, { is_read: true });
  }

  async generateAlertsForOrg(org_id: string) {
    this.logger.log(`Scanning alerts for org: ${org_id}`);

    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

    const expiringContracts = await this.contractRepository.find({
      where: {
        org_id: org_id,
        expiration_date: LessThanOrEqual(thirtyDaysFromNow),
        status: 'completed',
      },
    });

    for (const contract of expiringContracts) {
      if (!contract.expiration_date) continue;

      // Check if alert already exists for this contract and type
      const existing = await this.alertRepository.findOne({
        where: {
          contract_id: contract.id,
          alert_type: 'EXPIRATION',
        },
      });

      if (!existing) {
        this.logger.log(`Creating alert for contract: ${contract.title}`);

        const alert = this.alertRepository.create({
          title: `Contract Expiring: ${contract.title}`,
          message: `The contract "${contract.title}" with ${contract.counterparty_name || 'Counterparty'} is set to expire on ${new Date(contract.expiration_date).toLocaleDateString()}.`,
          alert_type: 'EXPIRATION',
          priority: AlertPriority.HIGH,
          org_id: contract.org_id,
          contract_id: contract.id,
          trigger_date: new Date(), // Set trigger date to now
          days_before: 30,
          status: 'pending'
        });

        const savedAlert = await this.alertRepository.save(alert);

        // Notify — Wrapped in try-catch to prevent 500 if integrations fail
        try {
          const org = await this.orgRepository.findOne({ where: { id: org_id } });
          const users = await this.userRepository.find({ where: { org_id } });

          // Email Notifications
          for (const user of users) {
            if (user.email) {
              await this.mailService.sendExpirationAlert(
                user.email, 
                contract.title, 
                new Date(contract.expiration_date).toLocaleDateString()
              );
            }
          }

          // Slack Notifications
          if (org?.settings?.slack_channel) {
            await this.slackService.sendExpirationAlert(
              org.settings.slack_channel,
              contract.title,
              new Date(contract.expiration_date).toLocaleDateString(),
              `https://legalpulse.ai/contracts/${contract.id}`
            );
          }
        } catch (notifyError) {
          this.logger.error(`Notification failed for alert ${savedAlert.id}: ${notifyError.message}`);
        }
      }
    }

    return { processed: expiringContracts.length };
  }
}
