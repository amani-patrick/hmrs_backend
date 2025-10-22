import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity({ name: 'payroll_records' })
export class PayrollRecord {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  userId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ type: 'date' })
  payDate: Date;

  @Column('decimal', { precision: 10, scale: 2 })
  grossSalary: number;

  @Column('decimal', { precision: 10, scale: 2 })
  taxDeductions: number;

  @Column('decimal', { precision: 10, scale: 2 })
  benefitsDeductions: number;

  @Column('decimal', { precision: 10, scale: 2 })
  netAmount: number;

  @Column({ type: 'varchar', default: 'Pending' })
  paymentStatus: string; // 'Pending', 'Processed', 'Failed'
  
  @Column({ type: 'varchar', nullable: true })
  iremboPayBillId: string; // Reference to the payment platform
  
  @CreateDateColumn()
  processedAt: Date;

  @Column({ type: 'jsonb', nullable: true })
  breakdown: {
    basicSalary: number;
    allowances: Record<string, number>;
    deductions: Record<string, number>;
    benefits: Record<string, number>;
  };
}
