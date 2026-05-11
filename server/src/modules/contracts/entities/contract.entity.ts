import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Org } from '../../orgs/entities/org.entity';
import { User } from '../../users/entities/user.entity';

@Entity('contracts')
export class Contract {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column({ nullable: true })
  contract_type: string;

  @Column({ default: 'processing' })
  status: string;

  @Column()
  file_url: string;

  @Column({ type: 'integer', nullable: true })
  file_size_bytes: number;

  @Column({ nullable: true })
  counterparty_name: string;

  @Column({ nullable: true })
  counterparty_type: string;

  @Column({ type: 'date', nullable: true })
  effective_date: Date;

  @Column({ type: 'date', nullable: true })
  expiration_date: Date;

  @Column({ type: 'boolean', default: false })
  auto_renewal: boolean;

  @Column({ type: 'text', nullable: true })
  auto_renewal_terms: string;

  @Column({ type: 'date', nullable: true })
  opt_out_deadline: Date;

  @Column({ type: 'integer', nullable: true })
  opt_out_notice_days: number;

  @Column({ nullable: true })
  governing_law: string;

  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  contract_value: number;

  @Column({ type: 'text', nullable: true })
  payment_terms: string;

  @Column({ type: 'text', nullable: true })
  liability_cap: string;

  @Column({ nullable: true })
  indemnification_party: string;

  @Column({ type: 'boolean', default: false })
  termination_for_convenience: boolean;

  @Column({ type: 'integer', nullable: true })
  termination_notice_days: number;

  @Column({ type: 'integer', nullable: true })
  risk_score: number;

  @Column({ type: 'jsonb', nullable: true })
  ai_extraction_raw: any;

  @Column({ type: 'jsonb', nullable: true })
  ai_extraction_confidence: any;

  @Column({ type: 'jsonb', default: {} })
  human_edits: any;

  @Column({ type: 'text', array: true, default: '{}' })
  tags: string[];

  @Column({ type: 'text', nullable: true })
  notes: string;

  // Vector column for pgvector semantic search (handled as string or specific type in TypeORM)
  @Column({ type: 'text', nullable: true })
  embedding: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @ManyToOne(() => Org, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'org_id' })
  org: Org;

  @Column()
  org_id: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'owner_id' })
  owner: User;

  @Column({ nullable: true })
  owner_id: string;
}
