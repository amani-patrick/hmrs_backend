import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, Index } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { JobPostingLocation } from '../../../common/enums/job-location.enum';
import { JobStatus } from '../../../common/enums/job-status.enum';

@Entity({ name: 'job_postings' })
@Index(['status', 'postingLocation']) 
export class JobPosting {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column({ type: 'text' })
  keyRequirements: string;

  @Column({ type: 'jsonb', nullable: true })
  details: any;

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

  @Column('int')
  minSalary: number;

  @Column('int')
  maxSalary: number;

  @Column({ type: 'boolean', default: true })
  isRemote: boolean;

  @Column({ type: 'text', nullable: true })
  location: string;

  @Column()
  hiringManagerId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'hiringManagerId' })
  hiringManager: User;

  @Column({ type: 'timestamp with time zone', nullable: true })
  publishedAt: Date | null;

  @Column({ type: 'timestamp with time zone', nullable: true })
  closedAt: Date | null;

  @CreateDateColumn()
  createdAt: Date;

  @CreateDateColumn()
  updatedAt: Date;
}