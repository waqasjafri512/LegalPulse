import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Matter } from './entities/matter.entity';
import { MattersController } from './matters.controller';
import { MattersService } from './matters.service';

@Module({
  imports: [TypeOrmModule.forFeature([Matter])],
  exports: [TypeOrmModule],
  controllers: [MattersController],
  providers: [MattersService],
})
export class MattersModule {}
