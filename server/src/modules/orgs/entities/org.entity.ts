import { Entity, PrimaryColumn, Column, CreateDateColumn, OneToMany } from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('orgs')
export class Org {
  @PrimaryColumn()
  id: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  industry: string;

  @Column({ default: 'starter' })
  plan_tier: string;

  @Column({ nullable: true })
  stripe_customer_id: string;

  @Column({ type: 'jsonb', default: {} })
  settings: any;

  @CreateDateColumn()
  created_at: Date;

  @OneToMany(() => User, (user) => user.org)
  users: User[];
}
