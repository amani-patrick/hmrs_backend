import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { TrainingProgram } from './training-program.entity';
import { CourseModule } from './course-module.entity';

export enum CourseStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  ARCHIVED = 'archived',
}

export enum CourseLevel {
  BEGINNER = 'beginner',
  INTERMEDIATE = 'intermediate',
  ADVANCED = 'advanced',
  EXPERT = 'expert',
}

export enum DeliveryMode {
  ONLINE = 'online',
  OFFLINE = 'offline',
  HYBRID = 'hybrid',
  SELF_PACED = 'self_paced',
}

@Entity({ name: 'courses' })
export class Course {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  tenantId: string;

  @Column({ nullable: true })
  programId: string | null;

  @ManyToOne(() => TrainingProgram, program => program.courses, { nullable: true })
  @JoinColumn({ name: 'programId' })
  program: TrainingProgram | null;

  @Column()
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'enum', enum: CourseStatus, default: CourseStatus.DRAFT })
  status: CourseStatus;

  @Column({ type: 'enum', enum: CourseLevel, default: CourseLevel.BEGINNER })
  level: CourseLevel;

  @Column({ type: 'enum', enum: DeliveryMode, default: DeliveryMode.ONLINE })
  deliveryMode: DeliveryMode;

  @Column({ nullable: true })
  duration: number; // In hours

  @Column({ type: 'jsonb', nullable: true })
  learningObjectives: string[];

  @Column({ nullable: true })
  instructorId: string | null;

  @Column({ nullable: true })
  instructorName: string | null;

  @Column({ nullable: true })
  categoryId: string | null;

  @Column({ default: 0 })
  enrollmentCount: number;

  @Column({ default: 0 })
  completionCount: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  averageRating: number;

  @Column({ default: 0 })
  totalRatings: number;

  @Column({ type: 'decimal', precision: 3, scale: 2, nullable: true })
  passingScore: number | null;

  @Column({ nullable: true })
  maxAttempts: number | null;

  @Column({ default: false })
  hasCertificate: boolean;

  @Column({ nullable: true })
  certificateTemplateId: string | null;

  @Column({ nullable: true })
  thumbnailUrl: string | null;

  @Column({ nullable: true })
  videoUrl: string | null;

  @Column({ type: 'jsonb', nullable: true })
  tags: string[];

  @Column({ type: 'jsonb', nullable: true })
  prerequisites: string[];

  @Column({ type: 'jsonb', nullable: true })
  resources: Array<{
    name: string;
    type: string;
    url: string;
  }>;

  @Column({ default: true })
  isActive: boolean;

  @Column({ default: false })
  isFeatured: boolean;

  @OneToMany(() => CourseModule, module => module.course)
  modules: CourseModule[];

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
