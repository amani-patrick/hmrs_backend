import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

@Entity({ name: 'leave_balances' })
@Index(['tenantId', 'employeeId', 'leaveTypeId'], { unique: true })
export class LeaveBalance {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  tenantId: string;

  @Column({ type: 'uuid' })
  employeeId: string;

  @Column({ type: 'varchar' })
  leaveTypeId: string;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  totalDays: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  usedDays: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  availableDays: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  pendingDays: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  carriedOverDays: number;

  @Column({ type: 'int' })
  year: number;

  @Column({ type: 'date', nullable: true })
  expiryDate: Date | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
