import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Org } from './entities/org.entity';

@Injectable()
export class OrgsService {
  constructor(
    @InjectRepository(Org)
    private orgRepository: Repository<Org>,
  ) {}

  async create(data: { clerkOrgId: string; name: string }) {
    const org = this.orgRepository.create({
      id: data.clerkOrgId, // We use Clerk's ID as our primary key or mapping
      name: data.name,
      settings: {},
    });
    return this.orgRepository.save(org);
  }

  async update(id: string, data: Partial<Org>) {
    await this.orgRepository.update(id, data);
    return this.orgRepository.findOne({ where: { id } });
  }

  async findOne(id: string) {
    return this.orgRepository.findOne({ where: { id } });
  }
}
