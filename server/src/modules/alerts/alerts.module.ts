import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AlertsService } from './alerts.service';
import { AlertsController } from './alerts.controller';
import { Alert } from './entities/alert.entity';
import { Contract } from '../contracts/entities/contract.entity';
import { ContractsModule } from '../contracts/contracts.module';
import { MailModule } from '../common/mail/mail.module';
import { SlackModule } from '../../common/slack/slack.module';
import { UsersModule } from '../users/users.module';
import { OrgsModule } from '../orgs/orgs.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Alert, Contract]),
    ContractsModule,
    MailModule,
    SlackModule,
    UsersModule,
    OrgsModule,
  ],
  controllers: [AlertsController],
  providers: [AlertsService],
  exports: [AlertsService],
})
export class AlertsModule {}
