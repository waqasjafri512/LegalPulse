import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ExtractionService } from './extraction.service';
import { ExtractionProcessor } from './extraction.processor';
import { ContractsModule } from '../contracts/contracts.module';
import { Contract } from '../contracts/entities/contract.entity';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'extraction',
    }),
    TypeOrmModule.forFeature([Contract]),
    ContractsModule,
  ],
  providers: [ExtractionService, ExtractionProcessor],
  exports: [BullModule],
})
export class ExtractionModule {}
