import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn, OneToMany, Index } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { JobPostingLocation } from '../../../common/enums/job-location.enum';
import { JobStatus } from '../../../common/enums/job-status.enum';
import { Candidate } from './candidate.entity';

export enum EmploymentType {
  FULL_TIME = 'full_time',
  PART_TIME = 'part_time',
  CONTRACT = 'contract',
  TEMPORARY = 'temporary',
  INTERNSHIP = 'internship',
  VOLUNTEER = 'volunteer'
}

@Entity({ name: 'job_postings' })
@Index(['status', 'postingLocation'])
export class JobPosting {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'text', nullable: true })
  keyRequirements: string;

  @Column({ type: 'jsonb', nullable: true })
  responsibilities: string[];

  @Column({ type: 'jsonb', nullable: true })
  benefits: string[];

  @Column({ 
    type: 'enum',
    enum: EmploymentType,
    default: EmploymentType.FULL_TIME
  })
  employmentType: EmploymentType;

  @Column({ type: 'varchar', length: 100 })
  location: string;

  @Column({ type: 'boolean', default: false })
  isRemote: boolean;

  @Column({ type: 'int', nullable: true })
  minSalary: number;

  @Column({ type: 'int', nullable: true })
  maxSalary: number;

  @Column({ type: 'varchar', length: 10, nullable: true })
  salaryCurrency: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  salaryPeriod: string; // e.g., 'year', 'month', 'hour'

  @Column({ 
    type: 'enum',
    enum: JobStatus,
    default: JobStatus.DRAFT
  })
  status: JobStatus;

  @Column({ 
    type: 'enum',
    enum: JobPostingLocation,
    default: JobPostingLocation.INTERNAL
  })
  postingLocation: JobPostingLocation;

  @Column({ type: 'jsonb', nullable: true })
  externalPlatformDetails: {
    platformName: string;
    url?: string;
    postingId?: string;
    applicationUrl?: string;
  };

  @Column({ type: 'boolean', default: false })
  isFeatured: boolean;

  @Column({ type: 'timestamp with time zone', nullable: true })
  publishedAt: Date | null;

  @Column({ type: 'timestamp with time zone', nullable: true })
  closedAt: Date | null;

  @Column({ type: 'uuid', nullable: true })
  hiringManagerId: string | null;

  @ManyToOne(() => User, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'hiringManagerId' })
  hiringManager: User | null;

  @OneToMany(() => Candidate, candidate => candidate.jobPosting)
  candidates: Candidate[];

  @Column({ type: 'int', default: 0 })
  viewCount: number;

  @Column({ type: 'jsonb', nullable: true })
  metadata: any;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updatedAt: Date;

  createdById: string | null;

  @ManyToOne(() => User, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'createdById' })
  createdBy: User | null;
}