import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export enum OnboardingStatus {
  NOT_STARTED = 'not_started',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

export enum OnboardingStage {
  PRE_BOARDING = 'pre_boarding',
  DAY_ONE = 'day_one',
  FIRST_WEEK = 'first_week',
  FIRST_MONTH = 'first_month',
  FIRST_QUARTER = 'first_quarter',
  COMPLETED = 'completed',
}

@Entity({ name: 'onboarding_processes' })
export class OnboardingProcess {
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
  startDate: Date;

  @Column({ type: 'enum', enum: OnboardingStatus, default: OnboardingStatus.NOT_STARTED })
  status: OnboardingStatus;

  @Column({ type: 'enum', enum: OnboardingStage, default: OnboardingStage.PRE_BOARDING })
  currentStage: OnboardingStage;

  @Column({ type: 'int', default: 0 })
  completionPercentage: number;

  @Column({ type: 'varchar', nullable: true })
  assignedHR: string | null;

  @Column({ type: 'varchar', nullable: true })
  assignedBuddy: string | null;

  @Column({ type: 'varchar', nullable: true })
  manager: string | null;

  @Column({ type: 'jsonb', nullable: true })
  checklist: {
    category: string;
    items: {
      id: string;
      task: string;
      completed: boolean;
      completedBy?: string;
      completedAt?: Date;
      dueDate?: Date;
    }[];
  }[];

  @Column({ type: 'jsonb', nullable: true })
  equipmentAssigned: {
    itemName: string;
    serialNumber?: string;
    assignedDate: Date;
    status: 'pending' | 'delivered' | 'returned';
  }[];

  @Column({ type: 'jsonb', nullable: true })
  documentsRequired: {
    documentName: string;
    received: boolean;
    receivedDate?: Date;
    notes?: string;
  }[];

  @Column({ type: 'date', nullable: true })
  completedDate: Date | null;

  @Column({ type: 'text', nullable: true })
  notes: string | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
