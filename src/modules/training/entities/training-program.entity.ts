import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { Course } from './course.entity';

export enum ProgramStatus {
  DRAFT = 'draft',
  ACTIVE = 'active',
  ARCHIVED = 'archived',
  COMPLETED = 'completed',
}

export enum ProgramType {
  ONBOARDING = 'onboarding',
  COMPLIANCE = 'compliance',
  TECHNICAL = 'technical',
  LEADERSHIP = 'leadership',
  SOFT_SKILLS = 'soft_skills',
  CERTIFICATION = 'certification',
  CUSTOM = 'custom',
}

@Entity({ name: 'training_programs' })
export class TrainingProgram {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  tenantId: string;

  @Column()
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'enum', enum: ProgramType, default: ProgramType.CUSTOM })
  type: ProgramType;

  @Column({ type: 'enum', enum: ProgramStatus, default: ProgramStatus.DRAFT })
  status: ProgramStatus;

  @Column({ type: 'jsonb', nullable: true })
  objectives: string[];

  @Column({ type: 'jsonb', nullable: true })
  targetAudience: string[];

  @Column({ nullable: true })
  duration: number; // In hours

  @Column({ type: 'date', nullable: true })
  startDate: Date | null;

  @Column({ type: 'date', nullable: true })
  endDate: Date | null;

  @Column({ nullable: true })
  instructorId: string | null;

  @Column({ nullable: true })
  instructorName: string | null;

  @Column({ nullable: true })
  categoryId: string | null;

  @Column({ nullable: true })
  categoryName: string | null;

  @Column({ default: 0 })
  totalEnrollments: number;

  @Column({ default: 0 })
  completedEnrollments: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  completionRate: number;

  @Column({ type: 'decimal', precision: 3, scale: 2, nullable: true })
  passingScore: number | null;

  @Column({ default: false })
  isMandatory: boolean;

  @Column({ default: false })
  isRecurring: boolean;

  @Column({ nullable: true })
  recurringInterval: string | null; // e.g., "yearly", "quarterly"

  @Column({ nullable: true })
  thumbnailUrl: string | null;

  @Column({ type: 'jsonb', nullable: true })
  tags: string[];

  @Column({ type: 'jsonb', nullable: true })
  prerequisites: string[];

  @Column({ nullable: true })
  certificateTemplateId: string | null;

  @Column({ default: true })
  isActive: boolean;

  @OneToMany(() => Course, course => course.program)
  courses: Course[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ nullable: true })
  createdBy: string | null;

  @Column({ nullable: true })
  updatedBy: string | null;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;
}
