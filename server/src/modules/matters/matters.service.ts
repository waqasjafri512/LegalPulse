import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Matter } from './entities/matter.entity';

@Injectable()
export class MattersService {
  constructor(
    @InjectRepository(Matter)
    private readonly matterRepository: Repository<Matter>,
  ) {}

  async create(data: Partial<Matter>, orgId: string) {
    const matter = this.matterRepository.create({
      ...data,
      org_id: orgId,
    });
    return this.matterRepository.save(matter);
  }

  async findAllByOrg(orgId: string) {
    return this.matterRepository.find({
      where: { org_id: orgId },
      order: { created_at: 'DESC' },
    });
  }

  async findOne(id: string, orgId: string) {
    const matter = await this.matterRepository.findOne({
      where: { id, org_id: orgId },
    });
    if (!matter) {
      throw new NotFoundException(`Matter with ID ${id} not found`);
    }
    return matter;
  }

  async update(id: string, data: Partial<Matter>, orgId: string) {
    await this.findOne(id, orgId); // Ensure it exists and belongs to org
    await this.matterRepository.update(id, data);
    return this.findOne(id, orgId);
  }

  async remove(id: string, orgId: string) {
    const matter = await this.findOne(id, orgId);
    await this.matterRepository.remove(matter);
    return { success: true };
  }
}
