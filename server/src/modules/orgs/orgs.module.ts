import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Org } from './entities/org.entity';
import { OrgsService } from './orgs.service';

@Module({
  imports: [TypeOrmModule.forFeature([Org])],
  exports: [TypeOrmModule, OrgsService],
  providers: [OrgsService],
})
export class OrgsModule {}
