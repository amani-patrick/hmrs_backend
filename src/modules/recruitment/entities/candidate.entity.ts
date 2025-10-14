import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { JobPosting } from './job-posting.entity';

@Entity({ name: 'candidates' })
export class Candidate {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column({ unique: true })
  email: string;

  @Column({ nullable: true })
  phoneNumber: string;

  @Column('int', { default: 0 })
  yearsOfExperience: number;
  
  @Column({ default: 'New' })
  status: string;

  @Column()
  jobPostingId: string;

  @ManyToOne(() => JobPosting)
  @JoinColumn({ name: 'jobPostingId' })
  jobPosting: JobPosting;

  @CreateDateColumn()
  appliedAt: Date;

  @Column({ nullable: true })
  hiredAt: Date | null;

  @Column({ nullable: true })
  rejectedAt: Date | null;
}