import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity({ name: 'leave_types' })
export class LeaveType {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  tenantId: string;

  @Column({ type: 'varchar' })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ type: 'int' })
  defaultDays: number;

  @Column({ default: true })
  requiresApproval: boolean;

  @Column({ default: true })
  isPaid: boolean;

  @Column({ default: true })
  isActive: boolean;

  @Column({ type: 'int', default: 0 })
  maxConsecutiveDays: number;

  @Column({ type: 'int', default: 0 })
  minDaysNotice: number;

  @Column({ default: false })
  allowNegativeBalance: boolean;

  @Column({ default: true })
  allowHalfDay: boolean;

  @Column({ type: 'jsonb', nullable: true })
  carryOverRules: {
    enabled: boolean;
    maxDays?: number;
    expiryMonths?: number;
  };

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
