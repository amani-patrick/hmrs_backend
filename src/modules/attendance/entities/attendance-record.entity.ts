import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

export enum AttendanceStatus {
  PRESENT = 'present',
  ABSENT = 'absent',
  LATE = 'late',
  HALF_DAY = 'half_day',
  ON_LEAVE = 'on_leave',
  HOLIDAY = 'holiday',
  WEEKEND = 'weekend',
}

export enum CheckInMethod {
  MANUAL = 'manual',
  BIOMETRIC = 'biometric',
  MOBILE_APP = 'mobile_app',
  WEB = 'web',
  SYSTEM = 'system',
}

@Entity({ name: 'attendance_records' })
@Index(['tenantId', 'employeeId', 'date'])
@Index(['tenantId', 'date'])
@Index(['tenantId', 'status'])
export class AttendanceRecord {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  tenantId: string;

  @Column()
  employeeId: string;

  @Column({ type: 'date' })
  date: Date;

  @Column({ type: 'enum', enum: AttendanceStatus })
  status: AttendanceStatus;

  @Column({ type: 'time', nullable: true })
  checkInTime: string | null;

  @Column({ type: 'time', nullable: true })
  checkOutTime: string | null;

  @Column({ type: 'time', nullable: true })
  expectedCheckIn: string | null;

  @Column({ type: 'time', nullable: true })
  expectedCheckOut: string | null;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  hoursWorked: number | null;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  overtimeHours: number | null;

  @Column({ default: false })
  isLate: boolean;

  @Column({ type: 'int', default: 0 })
  lateMinutes: number;

  @Column({ default: false })
  isEarlyLeave: boolean;

  @Column({ type: 'int', default: 0 })
  earlyLeaveMinutes: number;

  @Column({ type: 'enum', enum: CheckInMethod, nullable: true })
  checkInMethod: CheckInMethod | null;

  @Column({ type: 'enum', enum: CheckInMethod, nullable: true })
  checkOutMethod: CheckInMethod | null;

  @Column({ type: 'text', nullable: true })
  checkInLocation: string | null;

  @Column({ type: 'text', nullable: true })
  checkOutLocation: string | null;

  @Column({ type: 'text', nullable: true })
  notes: string | null;

  @Column({ nullable: true })
  approvedBy: string | null;

  @Column({ type: 'timestamp', nullable: true })
  approvedAt: Date | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;
}
