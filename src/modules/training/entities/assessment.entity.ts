import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Course } from './course.entity';

export enum AssessmentType {
  QUIZ = 'quiz',
  EXAM = 'exam',
  ASSIGNMENT = 'assignment',
  PRACTICAL = 'practical',
  SURVEY = 'survey',
}

export enum QuestionType {
  MULTIPLE_CHOICE = 'multiple_choice',
  TRUE_FALSE = 'true_false',
  SHORT_ANSWER = 'short_answer',
  ESSAY = 'essay',
  FILL_BLANK = 'fill_blank',
  MATCHING = 'matching',
}

@Entity({ name: 'assessments' })
export class Assessment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  tenantId: string;

  @Column({ type: 'uuid', nullable: true })
  courseId: string | null;

  @ManyToOne(() => Course, { nullable: true })
  @JoinColumn({ name: 'courseId' })
  course: Course | null;

  @Column({ type: 'varchar' })
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'enum', enum: AssessmentType })
  type: AssessmentType;

  @Column({ type: 'int', nullable: true })
  duration: number; // In minutes

  @Column({ type: 'decimal', precision: 3, scale: 2 })
  passingScore: number;

  @Column({ type: 'int', default: 1 })
  maxAttempts: number;

  @Column({ default: false })
  isRandomized: boolean;

  @Column({ default: false })
  showResults: boolean;

  @Column({ default: false })
  showCorrectAnswers: boolean;

  @Column({ type: 'jsonb' })
  questions: Array<{
    id: string;
    type: QuestionType;
    question: string;
    options?: string[];
    correctAnswer: string | string[];
    points: number;
    explanation?: string;
  }>;

  @Column({ default: 0 })
  totalPoints: number;

  @Column({ type: 'date', nullable: true })
  availableFrom: Date | null;

  @Column({ type: 'date', nullable: true })
  availableUntil: Date | null;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ type: 'uuid', nullable: true })
  createdBy: string | null;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;
}
