import { Module, forwardRef } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ExtractionService } from './extraction.service';
import { ExtractionProcessor } from './extraction.processor';
import { Contract } from '../contracts/entities/contract.entity';
import { AlertsModule } from '../alerts/alerts.module';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'extraction',
    }),
    TypeOrmModule.forFeature([Contract]),
    forwardRef(() => AlertsModule),
  ],
  providers: [ExtractionService, ExtractionProcessor],
  exports: [ExtractionService, BullModule],
})
export class ExtractionModule {}

