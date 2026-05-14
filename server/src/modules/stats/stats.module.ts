import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StatsService } from './stats.service';
import { StatsController } from './stats.controller';
import { Contract } from '../contracts/entities/contract.entity';
import { Alert } from '../alerts/entities/alert.entity';
import { Matter } from '../matters/entities/matter.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Contract, Alert, Matter]),
  ],
  providers: [StatsService],
  controllers: [StatsController],
  exports: [StatsService],
})
export class StatsModule {}
