import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThanOrEqual } from 'typeorm';
import { Alert, AlertPriority } from './entities/alert.entity';
import { Contract } from '../contracts/entities/contract.entity';
import { MailService } from '../common/mail/mail.service';
import { UsersService } from '../users/users.service';
import { SlackService } from '../../common/slack/slack.service';
import { OrgsService } from '../orgs/orgs.service';

@Injectable()
export class AlertsService {
  private readonly logger = new Logger(AlertsService.name);

  constructor(
    @InjectRepository(Alert)
    private readonly alertRepository: Repository<Alert>,
    @InjectRepository(Contract)
    private readonly contractRepository: Repository<Contract>,
    private readonly mailService: MailService,
    private readonly usersService: UsersService,
    private readonly slackService: SlackService,
    private readonly orgsService: OrgsService,
  ) {}

  async findAllByOrg(orgId: string) {
    return this.alertRepository.find({
      where: { org_id: orgId },
      order: { created_at: 'DESC' },
    });
  }

  async markAsRead(id: string, orgId: string) {
    await this.alertRepository.update({ id, org_id: orgId }, { is_read: true });
    return { success: true };
  }

  /**
   * Scans for contracts expiring in the next 30 days and creates alerts if they don't exist.
   */
  async generateAlertsForOrg(orgId: string) {
    this.logger.log(`Generating alerts for org: ${orgId}`);
    
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

    const expiringContracts = await this.contractRepository.find({
      where: {
        org_id: orgId,
        expiration_date: LessThanOrEqual(thirtyDaysFromNow),
        status: 'completed',
      },
    });

    const newAlerts = [];
    for (const contract of expiringContracts) {
      // Check if alert already exists for this contract and type
      const existing = await this.alertRepository.findOne({
        where: { 
          contract_id: contract.id, 
          alert_type: 'expiration',
          is_read: false 
        },
      });

      if (!existing) {
        const alert = this.alertRepository.create({
          title: `Contract Expiring: ${contract.title}`,
          message: `The contract with ${contract.counterparty_name || 'Counterparty'} is set to expire on ${new Date(contract.expiration_date).toLocaleDateString()}.`,
          alert_type: 'expiration',
          priority: AlertPriority.HIGH,
          is_read: false,
          org_id: orgId,
          contract_id: contract.id,
        });
        newAlerts.push(alert);

        // Send email notification
        try {
          const user = await this.usersService.findByClerkId(contract.owner_id);
          if (user && user.email) {
            await this.mailService.sendExpirationAlert(
              user.email,
              contract.title,
              new Date(contract.expiration_date).toLocaleDateString()
            );
          }
        } catch (emailErr) {
          this.logger.error(`Failed to send alert email for contract ${contract.id}: ${emailErr.message}`);
        }

        // Send Slack notification
        try {
          const org = await this.orgsService.findOne(orgId);
          const slackChannel = org?.settings?.slackChannel;
          if (slackChannel) {
            await this.slackService.sendExpirationAlert(
              slackChannel,
              contract.title,
              new Date(contract.expiration_date).toLocaleDateString(),
              `https://legalpulse.ai/contracts/${contract.id}`
            );
          }
        } catch (slackErr) {
          this.logger.error(`Failed to send Slack alert for contract ${contract.id}: ${slackErr.message}`);
        }
      }
    }

    if (newAlerts.length > 0) {
      await this.alertRepository.save(newAlerts);
    }

    return { created: newAlerts.length };
  }
}
