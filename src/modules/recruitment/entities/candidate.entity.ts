import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { JobPosting } from './job-posting.entity';
import { Interview } from './interview.entity';

export enum CandidateStatus {
  NEW = 'New',
  SCREENING = 'Screening',
  INTERVIEW = 'Interview',
  OFFER = 'Offer',
  HIRED = 'Hired',
  REJECTED = 'Rejected',
  WITHDRAWN = 'Withdrawn'
}

@Entity({ name: 'candidates' })
export class Candidate {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column()
  email: string;

  @Column({ nullable: true })
  phoneNumber: string;

  @Column({ type: 'varchar', nullable: true })
  location: string;

  @Column({ type: 'text', nullable: true })
  summary: string;

  @Column({ type: 'jsonb', nullable: true })
  skills: string[];

  @Column({ type: 'jsonb', nullable: true })
  experience: Array<{
    title: string;
    company: string;
    startDate: string;
    endDate?: string;
    current: boolean;
    description?: string;
  }>;

  @Column({ type: 'jsonb', nullable: true })
  education: Array<{
    degree: string;
    institution: string;
    fieldOfStudy: string;
    startYear: number;
    endYear?: number;
  }>;

  @Column({ type: 'varchar', nullable: true })
  resumeUrl: string;

  @Column({ type: 'varchar', nullable: true })
  linkedinUrl: string;

  @Column({ type: 'varchar', nullable: true })
  githubUrl: string;

  @Column({ type: 'varchar', nullable: true })
  portfolioUrl: string;

  @Column({ 
    type: 'enum',
    enum: CandidateStatus,
    default: CandidateStatus.NEW
  })
  status: CandidateStatus;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  rating: number;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ type: 'jsonb', nullable: true })
  customFields: Record<string, any>;

  @Column()
  jobPostingId: string;

  @ManyToOne(() => JobPosting, jobPosting => jobPosting.candidates, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'jobPostingId' })
  jobPosting: JobPosting;

  @OneToMany(() => Interview, interview => interview.candidate)
  interviews: Interview[];

  @CreateDateColumn({ type: 'timestamp with time zone' })
  appliedAt: Date;

  @Column({ type: 'timestamp with time zone', nullable: true })
  hiredAt: Date | null;

  @Column({ type: 'timestamp with time zone', nullable: true })
  rejectedAt: Date | null;

  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updatedAt: Date;

  @Column({ type: 'jsonb', nullable: true })
  metadata: any;
}