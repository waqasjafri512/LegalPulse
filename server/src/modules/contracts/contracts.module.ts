import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bullmq';
import { ContractsService } from './contracts.service';
import { ContractsController } from './contracts.controller';
import { Contract } from './entities/contract.entity';
import { CloudinaryModule } from '../../common/cloudinary/cloudinary.module';
import { ExtractionModule } from '../extraction/extraction.module';
import { AlertsModule } from '../alerts/alerts.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Contract]),
    CloudinaryModule,
    forwardRef(() => ExtractionModule),
    forwardRef(() => AlertsModule),
    BullModule.registerQueue({
      name: 'extraction',
    }),
  ],

  controllers: [ContractsController],
  providers: [ContractsService],
  exports: [ContractsService],
})
export class ContractsModule {}
