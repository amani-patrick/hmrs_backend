import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export enum OffboardingStatus {
  INITIATED = 'initiated',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

export enum OffboardingReason {
  RESIGNATION = 'resignation',
  TERMINATION = 'termination',
  RETIREMENT = 'retirement',
  CONTRACT_END = 'contract_end',
  MUTUAL_AGREEMENT = 'mutual_agreement',
  OTHER = 'other',
}

@Entity({ name: 'offboarding_processes' })
export class OffboardingProcess {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  tenantId: string;

  @Column({ type: 'uuid' })
  employeeId: string;

  @Column({ type: 'varchar' })
  employeeName: string;

  @Column({ type: 'varchar' })
  position: string;

  @Column({ type: 'varchar' })
  department: string;

  @Column({ type: 'date' })
  lastWorkingDay: Date;

  @Column({ type: 'enum', enum: OffboardingReason })
  reason: OffboardingReason;

  @Column({ type: 'enum', enum: OffboardingStatus, default: OffboardingStatus.INITIATED })
  status: OffboardingStatus;

  @Column({ type: 'int', default: 0 })
  completionPercentage: number;

  @Column({ type: 'varchar', nullable: true })
  initiatedBy: string | null;

  @Column({ type: 'varchar', nullable: true })
  assignedHR: string | null;

  @Column({ type: 'jsonb', nullable: true })
  checklist: {
    category: string;
    items: {
      id: string;
      task: string;
      completed: boolean;
      completedBy?: string;
      completedAt?: Date;
    }[];
  }[];

  @Column({ type: 'jsonb', nullable: true })
  equipmentToReturn: {
    itemName: string;
    serialNumber?: string;
    returned: boolean;
    returnedDate?: Date;
    condition?: string;
  }[];

  @Column({ type: 'jsonb', nullable: true })
  accessRevocations: {
    systemName: string;
    revoked: boolean;
    revokedDate?: Date;
    revokedBy?: string;
  }[];

  @Column({ default: false })
  exitInterviewCompleted: boolean;

  @Column({ type: 'date', nullable: true })
  exitInterviewDate: Date | null;

  @Column({ type: 'text', nullable: true })
  exitInterviewNotes: string | null;

  @Column({ type: 'int', nullable: true })
  exitInterviewRating: number | null;

  @Column({ default: false })
  wouldRehire: boolean;

  @Column({ type: 'text', nullable: true })
  finalNotes: string | null;

  @Column({ type: 'date', nullable: true })
  completedDate: Date | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
