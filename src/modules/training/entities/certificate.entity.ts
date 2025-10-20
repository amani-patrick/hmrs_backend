import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Course } from './course.entity';
import { TrainingProgram } from './training-program.entity';

export enum CertificateStatus {
  ISSUED = 'issued',
  REVOKED = 'revoked',
  EXPIRED = 'expired',
}

@Entity({ name: 'certificates' })
export class Certificate {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  tenantId: string;

  @Column({ unique: true })
  certificateNumber: string;

  @Column()
  learnerId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'learnerId' })
  learner: User;

  @Column({ nullable: true })
  courseId: string | null;

  @ManyToOne(() => Course, { nullable: true })
  @JoinColumn({ name: 'courseId' })
  course: Course | null;

  @Column({ nullable: true })
  programId: string | null;

  @ManyToOne(() => TrainingProgram, { nullable: true })
  @JoinColumn({ name: 'programId' })
  program: TrainingProgram | null;

  @Column()
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'date' })
  issuedDate: Date;

  @Column({ type: 'date', nullable: true })
  expiryDate: Date | null;

  @Column({ type: 'enum', enum: CertificateStatus, default: CertificateStatus.ISSUED })
  status: CertificateStatus;

  @Column({ nullable: true })
  issuedBy: string | null;

  @Column({ nullable: true })
  issuedByName: string | null;

  @Column({ nullable: true })
  templateId: string | null;

  @Column({ nullable: true })
  certificateUrl: string | null;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  score: number | null;

  @Column({ type: 'jsonb', nullable: true })
  achievements: string[];

  @Column({ type: 'text', nullable: true })
  verificationCode: string | null;

  @Column({ default: false })
  isVerified: boolean;

  @Column({ default: 0 })
  verificationCount: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;
}
