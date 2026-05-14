import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThanOrEqual } from 'typeorm';
import { Contract } from '../contracts/entities/contract.entity';
import { Alert } from '../alerts/entities/alert.entity';
import { Matter } from '../matters/entities/matter.entity';

@Injectable()
export class StatsService {
  constructor(
    @InjectRepository(Contract)
    private readonly contractRepository: Repository<Contract>,
    @InjectRepository(Alert)
    private readonly alertRepository: Repository<Alert>,
    @InjectRepository(Matter)
    private readonly matterRepository: Repository<Matter>,
  ) {}

  async getDashboardStats(orgId: string) {
    const ninetyDaysFromNow = new Date();
    ninetyDaysFromNow.setDate(ninetyDaysFromNow.getDate() + 90);

    const [
      totalContracts,
      expiringContracts,
      activeAlerts,
      openMatters,
    ] = await Promise.all([
      // 1. Total Contracts
      this.contractRepository.count({ where: { org_id: orgId } }),
      
      // 2. Expiring in 90 Days
      this.contractRepository.count({
        where: {
          org_id: orgId,
          expiration_date: LessThanOrEqual(ninetyDaysFromNow),
          status: 'completed',
        },
      }),

      // 3. Active (Unread) Alerts
      this.alertRepository.count({
        where: {
          org_id: orgId,
          is_read: false,
        },
      }),

      // 4. Open Matters
      this.matterRepository.count({
        where: {
          org_id: orgId,
          status: 'open', // Assuming 'open' is a valid status
        },
      }),
    ]);

    return {
      totalContracts,
      expiringContracts,
      activeAlerts,
      openMatters,
    };
  }
}
