import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Org } from '../../orgs/entities/org.entity';
import { Contract } from '../../contracts/entities/contract.entity';
import { User } from '../../users/entities/user.entity';

export enum AlertPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
}

@Entity('alerts')
export class Alert {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  alert_type: string;

  @Column({ type: 'date' })
  trigger_date: Date;

  @Column({ type: 'integer' })
  days_before: number;

  @Column({ default: 'pending' })
  status: string;

  @Column({ type: 'text', nullable: true })
  title: string;

  @Column({ type: 'text', nullable: true })
  message: string;

  @Column({ type: 'varchar', nullable: true })
  priority: AlertPriority;

  @Column({ default: false })
  is_read: boolean;

  @Column({ default: 'pending' })
  resolution_note: string;

  @Column({ type: 'timestamptz', nullable: true })
  resolved_at: Date;

  @Column({ type: 'date', nullable: true })
  snoozed_until: Date;

  @CreateDateColumn()
  created_at: Date;

  @ManyToOne(() => Org, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'org_id' })
  org: Org;

  @Column()
  org_id: string;

  @ManyToOne(() => Contract, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'contract_id' })
  contract: Contract;

  @Column()
  contract_id: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'resolved_by' })
  resolver: User;

  @Column({ nullable: true })
  resolved_by: string;
}
