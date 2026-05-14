import { Entity, PrimaryColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Org } from '../../orgs/entities/org.entity';

export enum UserRole {
  ADMIN = 'admin',
  ATTORNEY = 'attorney',
  PARALEGAL = 'paralegal',
  REQUESTER = 'requester',
  READONLY = 'readonly',
}

@Entity('users')
export class User {
  @PrimaryColumn()
  id: string;

  @Column({ unique: true })
  clerk_user_id: string;

  @Column()
  email: string;

  @Column({ nullable: true })
  full_name: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.READONLY,
  })
  role: UserRole;

  @CreateDateColumn()
  created_at: Date;

  @ManyToOne(() => Org, (org) => org.users, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'org_id' })
  org: Org;

  @Column()
  org_id: string;
}
