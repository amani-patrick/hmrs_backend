import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export enum PathStatus {
  DRAFT = 'draft',
  ACTIVE = 'active',
  ARCHIVED = 'archived',
}

@Entity({ name: 'learning_paths' })
export class LearningPath {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  tenantId: string;

  @Column()
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'enum', enum: PathStatus, default: PathStatus.DRAFT })
  status: PathStatus;

  @Column({ type: 'jsonb' })
  steps: Array<{
    id: string;
    type: 'course' | 'program' | 'assessment';
    itemId: string;
    title: string;
    order: number;
    isMandatory: boolean;
    estimatedDuration?: number;
  }>;

  @Column({ nullable: true })
  duration: number; // Total duration in hours

  @Column({ type: 'jsonb', nullable: true })
  targetRoles: string[];

  @Column({ type: 'jsonb', nullable: true })
  skills: string[];

  @Column({ nullable: true })
  thumbnailUrl: string | null;

  @Column({ default: 0 })
  enrollmentCount: number;

  @Column({ default: 0 })
  completionCount: number;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ nullable: true })
  createdBy: string | null;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;
}
