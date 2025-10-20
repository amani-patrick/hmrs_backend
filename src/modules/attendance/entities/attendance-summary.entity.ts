import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

@Entity({ name: 'attendance_summaries' })
@Index(['tenantId', 'employeeId', 'month', 'year'], { unique: true })
export class AttendanceSummary {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  tenantId: string;

  @Column()
  employeeId: string;

  @Column()
  employeeName: string;

  @Column({ nullable: true })
  department: string | null;

  @Column({ nullable: true })
  position: string | null;

  @Column({ type: 'int' })
  month: number; // 1-12

  @Column({ type: 'int' })
  year: number;

  @Column({ type: 'int', default: 0 })
  workingDays: number;

  @Column({ type: 'int', default: 0 })
  presentDays: number;

  @Column({ type: 'int', default: 0 })
  absentDays: number;

  @Column({ type: 'int', default: 0 })
  lateDays: number;

  @Column({ type: 'int', default: 0 })
  halfDays: number;

  @Column({ type: 'int', default: 0 })
  leaveDays: number;

  @Column({ type: 'int', default: 0 })
  holidays: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  attendanceRate: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  punctualityRate: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  totalHours: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  overtimeHours: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  averageHours: number;

  @Column({ type: 'int', default: 0 })
  totalLateMinutes: number;

  @Column({ type: 'int', default: 0 })
  totalEarlyLeaveMinutes: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
