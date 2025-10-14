import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { JobPosting } from './entities/job-posting.entity';
import { Candidate } from './entities/candidate.entity';
import { CreateJobPostingDto } from './dto/create-job-posting.dto';
import { UpdateJobPostingDto } from './dto/update-job-posting.dto';
import { CreateCandidateDto } from './dto/create-candidate.dto';
import { UpdateCandidateDto } from './dto/update-candidate.dto';
import { JobStatus } from '../../common/enums/job-status.enum';

@Injectable()
export class RecruitmentService {   
  constructor(
    @Inject('JOB_POSTING_REPOSITORY')
    private readonly jobPostingRepository: Repository<JobPosting>,
    @Inject('CANDIDATE_REPOSITORY')
    private readonly candidateRepository: Repository<Candidate>,
  ) {}

  // Job Posting CRUD
  async createJobPosting(createJobPostingDto: CreateJobPostingDto): Promise<JobPosting> {
    const jobPosting = new JobPosting();
    Object.assign(jobPosting, createJobPostingDto);
    
    if (!jobPosting.status) {
      jobPosting.status = JobStatus.DRAFT;
    }
    
    if (!jobPosting.publishedAt) {
      jobPosting.publishedAt = new Date();
    }
    
    return this.jobPostingRepository.save(jobPosting);
  }

  async findAllJobPostings(): Promise<JobPosting[]> {
    return this.jobPostingRepository.find({
      relations: ['hiringManager']
    });
  }

  async findJobPostingById(id: string): Promise<JobPosting> {
    const jobPosting = await this.jobPostingRepository.findOne({ 
      where: { id },
      relations: ['hiringManager']
    });
    
    if (!jobPosting) {
      throw new NotFoundException(`Job posting with ID ${id} not found`);
    }
    
    return jobPosting;
  }

  async updateJobPosting(
    id: string,
    updateJobPostingDto: UpdateJobPostingDto,
  ): Promise<JobPosting> {
    const jobPosting = await this.findJobPostingById(id);
    
    // Handle status changes
    if (updateJobPostingDto.status === JobStatus.PUBLISHED && !jobPosting.publishedAt) {
      jobPosting.publishedAt = new Date();
    } else if (updateJobPostingDto.status === JobStatus.CLOSED && !jobPosting.closedAt) {
      jobPosting.closedAt = new Date();
    }
    
    // Update other fields
    Object.assign(jobPosting, updateJobPostingDto);
    
    return this.jobPostingRepository.save(jobPosting);
  }

  async removeJobPosting(id: string): Promise<void> {
    const result = await this.jobPostingRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Job posting with ID ${id} not found`);
    }
  }

  // Candidate CRUD
  async createCandidate(createCandidateDto: CreateCandidateDto): Promise<Candidate> {
    // Verify job posting exists
    await this.findJobPostingById(createCandidateDto.jobPostingId);
    
    const candidate = new Candidate();
    Object.assign(candidate, {
      ...createCandidateDto,
      status: 'New', // Default status
      appliedAt: new Date(),
    });
    
    return this.candidateRepository.save(candidate);
  }

  async findAllCandidates(): Promise<Candidate[]> {
    return this.candidateRepository.find({
      relations: ['jobPosting'],
    });
  }

  async findCandidateById(id: string): Promise<Candidate> {
    const candidate = await this.candidateRepository.findOne({
      where: { id },
      relations: ['jobPosting'],
    });
    
    if (!candidate) {
      throw new NotFoundException(`Candidate with ID ${id} not found`);
    }
    
    return candidate;
  }

  async updateCandidate(
    id: string,
    updateCandidateDto: UpdateCandidateDto,
  ): Promise<Candidate> {
    const candidate = await this.findCandidateById(id);
    
    // If updating jobPostingId, verify the new job posting exists
    if (updateCandidateDto.jobPostingId && updateCandidateDto.jobPostingId !== candidate.jobPostingId) {
      await this.findJobPostingById(updateCandidateDto.jobPostingId);
    }
    
    Object.assign(candidate, updateCandidateDto);
    
    return this.candidateRepository.save(candidate);
  }

  async removeCandidate(id: string): Promise<void> {
    const result = await this.candidateRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Candidate with ID ${id} not found`);
    }
  }

  // Additional business logic methods
  async updateCandidateStatus(id: string, status: string): Promise<Candidate> {
    const candidate = await this.findCandidateById(id);
    candidate.status = status;
    
    if (status === 'Hired') {
      candidate.hiredAt = new Date();
      candidate.rejectedAt = null; 
    } else if (status === 'Rejected') {
      candidate.rejectedAt = new Date();
      candidate.hiredAt = null; 
    } else {
      candidate.hiredAt = null;
      candidate.rejectedAt = null;
    }
    
    return this.candidateRepository.save(candidate);
  }

  // Statistics and Analytics Methods
  
  async getJobPostingStats() {
    const [total, active, draft, closed] = await Promise.all([
      this.jobPostingRepository.count(),
      this.jobPostingRepository.count({ where: { status: JobStatus.PUBLISHED } }),
      this.jobPostingRepository.count({ where: { status: JobStatus.DRAFT } }),
      this.jobPostingRepository.count({ where: { status: JobStatus.CLOSED } }),
    ]);

    return {
      total,
      active,
      draft,
      closed,
    };
  }

  async getCandidateStats() {
    const [total, newCandidates, hired, rejected] = await Promise.all([
      this.candidateRepository.count(),
      this.candidateRepository.count({ where: { status: 'New' } }),
      this.candidateRepository.count({ where: { status: 'Hired' } }),
      this.candidateRepository.count({ where: { status: 'Rejected' } }),
    ]);

    return {
      total,
      new: newCandidates,
      hired,
      rejected,
    };
  }

  async getInterviewCalendar() {
    // In a real application, this would query an interview table
    // For now, return mock data
    return {
      totalScheduled: 0,
      completed: 0,
      today: [],
      thisWeek: [],
    };
  }
}
