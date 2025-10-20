import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Course } from './course.entity';

export enum ModuleType {
  VIDEO = 'video',
  DOCUMENT = 'document',
  QUIZ = 'quiz',
  ASSIGNMENT = 'assignment',
  INTERACTIVE = 'interactive',
  LIVE_SESSION = 'live_session',
}

@Entity({ name: 'course_modules' })
export class CourseModule {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  tenantId: string;

  @Column()
  courseId: string;

  @ManyToOne(() => Course, course => course.modules, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'courseId' })
  course: Course;

  @Column()
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'enum', enum: ModuleType })
  type: ModuleType;

  @Column({ default: 0 })
  orderIndex: number;

  @Column({ nullable: true })
  duration: number; // In minutes

  @Column({ nullable: true })
  contentUrl: string | null;

  @Column({ type: 'text', nullable: true })
  content: string | null;

  @Column({ type: 'jsonb', nullable: true })
  resources: Array<{
    name: string;
    type: string;
    url: string;
  }>;

  @Column({ default: false })
  isMandatory: boolean;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ nullable: true })
  createdBy: string | null;
}
