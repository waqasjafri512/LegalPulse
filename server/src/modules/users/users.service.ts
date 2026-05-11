import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRole } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async create(data: { clerkUserId: string; email: string; fullName: string; orgId: string }) {
    const user = this.userRepository.create({
      clerk_user_id: data.clerkUserId,
      email: data.email,
      full_name: data.fullName,
      org_id: data.orgId,
      role: UserRole.READONLY, // Default role
    });
    return this.userRepository.save(user);
  }

  async update(clerkUserId: string, data: Partial<User>) {
    await this.userRepository.update({ clerk_user_id: clerkUserId }, data);
    return this.userRepository.findOne({ where: { clerk_user_id: clerkUserId } });
  }

  async findByClerkId(clerkUserId: string) {
    return this.userRepository.findOne({ where: { clerk_user_id: clerkUserId }, relations: ['org'] });
  }

  async setRole(clerkUserId: string, role: UserRole) {
    await this.userRepository.update({ clerk_user_id: clerkUserId }, { role });
  }
}
