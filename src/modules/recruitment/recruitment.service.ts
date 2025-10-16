import { 
  Inject, 
  Injectable, 
  NotFoundException, 
  BadRequestException 
} from '@nestjs/common';
import { 
  Between, 
  In, 
  IsNull, 
  LessThanOrEqual, 
  FindOptionsRelations,
  FindManyOptions,
  ILike,
  FindOptionsOrder,
  FindOptionsWhere,
  MoreThanOrEqual,
  Repository,
  Not
} from 'typeorm';
import { PaginationParams, PaginatedResponse } from '../../common/dto/pagination.dto';
import { JobPosting, EmploymentType } from './entities/job-posting.entity';
import { Candidate, CandidateStatus } from './entities/candidate.entity';
import { Interview, InterviewStatus, InterviewType } from './entities/interview.entity';
import { CreateJobPostingDto } from './dto/create-job-posting.dto';
import { UpdateJobPostingDto } from './dto/update-job-posting.dto';
import { CreateCandidateDto } from './dto/create-candidate.dto';
import { UpdateCandidateDto } from './dto/update-candidate.dto';
import { JobStatus } from '../../common/enums/job-status.enum';
import { CreateInterviewDto, UpdateInterviewDto } from './dto/interview.dto';
import { RecruitmentStatsResponseDto, CandidateStatsDto, InterviewStatsDto, JobPostingStatsDto } from './dto/recruitment-stats.dto';
import { HiringPipelineResponseDto, HiringPipelineJobDto, HiringPipelineStageDto } from './dto/hiring-pipeline-response.dto';
import * as moment from 'moment';

@Injectable()
export class RecruitmentService {   
  constructor(
    @Inject('JOB_POSTING_REPOSITORY')
    private readonly jobPostingRepository: Repository<JobPosting>,
    @Inject('CANDIDATE_REPOSITORY')
    private readonly candidateRepository: Repository<Candidate>,
    @Inject('INTERVIEW_REPOSITORY')
    private readonly interviewRepository: Repository<Interview>,
  ) {}

  // ========== Job Posting Methods ==========
  async createJobPosting(createJobPostingDto: CreateJobPostingDto): Promise<JobPosting> {
    const jobPosting = this.jobPostingRepository.create({
      ...createJobPostingDto,
      status: createJobPostingDto.status || JobStatus.DRAFT,
      publishedAt: createJobPostingDto.status === JobStatus.PUBLISHED ? new Date() : null,
      isFeatured: false, 
    } as JobPosting);
    
    return this.jobPostingRepository.save(jobPosting);
  }

  async findAllJobPostings(
    filters: {
      status?: JobStatus;
      isFeatured?: boolean;
      employmentType?: EmploymentType;
      location?: string;
      search?: string;
    } = {},
    paginationParams: PaginationParams = new PaginationParams()
  ): Promise<PaginatedResponse<JobPosting>> {
    const pagination = paginationParams || new PaginationParams();
    const { page, limit, sortBy, sortOrder, search: searchTerm } = pagination;
    const where: FindOptionsWhere<JobPosting> = {};
    const relations: FindOptionsRelations<JobPosting> = {
      hiringManager: true,
      candidates: true,
    };
    const order: FindOptionsOrder<JobPosting> = {};

    // Apply filters
    if (filters.status) where.status = filters.status;
    if (filters.isFeatured !== undefined) where.isFeatured = filters.isFeatured;
    if (filters.employmentType) where.employmentType = filters.employmentType;
    if (filters.location) where.location = ILike(`%${filters.location}%`);
    
    // Apply search
    if (searchTerm) {
      where.title = ILike(`%${searchTerm}%`);
      where.description = ILike(`%${searchTerm}%`);
    }

    // Apply sorting
    if (sortBy) {
      order[sortBy] = sortOrder || 'DESC';
    } else {
      order.createdAt = 'DESC'; // Default sorting
    }

    // Handle pagination
    const [data, total] = await this.jobPostingRepository.findAndCount({
      where,
      relations,
      order,
      skip: (page - 1) * limit,
      take: limit,
    });
    
    return new PaginatedResponse(data, total, { page, limit, sortBy, sortOrder, search: searchTerm });
  }

  async findJobPostingById(id: string): Promise<JobPosting> {
    const jobPosting = await this.jobPostingRepository.findOne({ 
      where: { id },
      relations: ['hiringManager', 'candidates']
    });
    
    if (!jobPosting) {
      throw new NotFoundException(`Job posting with ID ${id} not found`);
    }
    
    // Increment view count
    jobPosting.viewCount = (jobPosting.viewCount || 0) + 1;
    await this.jobPostingRepository.save(jobPosting);
    
    return jobPosting;
  }

  async updateJobPosting(
    id: string,
    updateJobPostingDto: UpdateJobPostingDto & { publishedAt?: Date; closedAt?: Date },
  ): Promise<JobPosting> {
    const jobPosting = await this.findJobPostingById(id);
    const updateData: any = { ...updateJobPostingDto };

    if (updateData.status === JobStatus.PUBLISHED && jobPosting.status !== JobStatus.PUBLISHED) {
      updateData.publishedAt = new Date();
    } else if (updateData.status === JobStatus.CLOSED && jobPosting.status !== JobStatus.CLOSED) {
      updateData.closedAt = new Date();
    }
    
    Object.assign(jobPosting, updateData);
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
    await this.findJobPostingById(createCandidateDto.jobPostingId);
    
    const candidate = new Candidate();
    Object.assign(candidate, {
      ...createCandidateDto,
      status: 'New', // Default status
      appliedAt: new Date(),
    });
    
    return this.candidateRepository.save(candidate);
  }

  async findAllCandidates(
    filters: {
      jobPostingId?: string;
      search?: string;
    } = {},
    paginationParams: PaginationParams = new PaginationParams()
  ): Promise<PaginatedResponse<Candidate>> {
    const pagination = paginationParams || new PaginationParams();
    const { page = 1, limit = 10, sortBy, sortOrder, search: searchTerm } = pagination;
    const where: FindOptionsWhere<Candidate> = {};
    const relations: FindOptionsRelations<Candidate> = {
      jobPosting: true,
      interviews: {
        interviewer: true,
      }
    };
    
    // Apply search
    if (searchTerm) {
      where['name'] = ILike(`%${searchTerm}%`) as any;
      // You can add more searchable fields as needed
    }

    const order: FindOptionsOrder<Candidate> = {};
    if (sortBy) {
      order[sortBy as keyof Candidate] = sortOrder || 'DESC';
    } else {
      order.appliedAt = 'DESC';
    }

    // Handle pagination
    const [data, total] = await this.candidateRepository.findAndCount({
      where,
      relations,
      order,
      skip: (page - 1) * limit,
      take: limit,
    });
    
    return new PaginatedResponse(data, total, {
      page,
      limit,
      sortBy: sortBy as keyof Candidate,
      sortOrder: sortOrder as 'ASC' | 'DESC',
      search: searchTerm,
    });
  }

  async getCandidateStats(): Promise<CandidateStatsDto> {
    const [total, newCandidates, screening, interview, offer, hired, rejected] = await Promise.all([
      this.candidateRepository.count(),
      this.candidateRepository.count({ where: { status: CandidateStatus.NEW } }),
      this.candidateRepository.count({ where: { status: CandidateStatus.SCREENING } }),
      this.candidateRepository.count({ where: { status: CandidateStatus.INTERVIEW } }),
      this.candidateRepository.count({ where: { status: CandidateStatus.OFFER } }),
      this.candidateRepository.count({ where: { status: CandidateStatus.HIRED } }),
      this.candidateRepository.count({ where: { status: CandidateStatus.REJECTED } }),
    ]);

    return {
      total,
      new: newCandidates,
      screening,
      interview,
      offer,
      hired,
      rejected,
    } as CandidateStatsDto;
  }

  async getHiringPipeline(): Promise<HiringPipelineResponseDto> {
    const activeJobs = await this.jobPostingRepository.find({
      where: { status: JobStatus.PUBLISHED },
      relations: ['candidates'],
    });

    const pipelineJobs: HiringPipelineJobDto[] = [];
    let totalCandidates = 0;
    let totalHired = 0;
    let totalConversionRate = 0;

    // Process each job to get pipeline data
    for (const job of activeJobs) {
      const candidates = job.candidates || [];
      const totalJobCandidates = candidates.length;
      totalCandidates += totalJobCandidates;

      // Group candidates by status
      const statusCounts = candidates.reduce((acc, candidate) => {
        acc[candidate.status] = (acc[candidate.status] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      // Calculate conversion rate [Simple version]
      const applied = statusCounts[CandidateStatus.NEW] || 0;
      const interviewed = statusCounts[CandidateStatus.INTERVIEW] || 0;
      const conversionRate = applied > 0 ? Math.round((interviewed / applied) * 100) : 0;
      
      totalConversionRate += conversionRate;
      totalHired += statusCounts[CandidateStatus.HIRED] || 0;

      // Create pipeline stages
      const stages: HiringPipelineStageDto[] = [
        { name: 'Applied', count: applied, conversionRate: 0 },
        { 
          name: 'Screening', 
          count: statusCounts[CandidateStatus.SCREENING] || 0,
          conversionRate: applied > 0 ? Math.round(((statusCounts[CandidateStatus.SCREENING] || 0) / applied) * 100) : 0,
        },
        { 
          name: 'Interview', 
          count: interviewed,
          conversionRate: conversionRate,
        },
        { 
          name: 'Offer', 
          count: statusCounts[CandidateStatus.OFFER] || 0,
          conversionRate: interviewed > 0 ? Math.round(((statusCounts[CandidateStatus.OFFER] || 0) / interviewed) * 100) : 0,
        },
        { 
          name: 'Hired', 
          count: statusCounts[CandidateStatus.HIRED] || 0,
          conversionRate: (statusCounts[CandidateStatus.OFFER] > 0) 
            ? Math.round(((statusCounts[CandidateStatus.HIRED] || 0) / statusCounts[CandidateStatus.OFFER]) * 100) 
            : 0,
        },
      ];

      pipelineJobs.push({
        jobId: job.id,
        title: job.title,
        totalCandidates: totalJobCandidates,
        stages,
      });
    }

    // Calculate average conversion rate
    const averageConversionRate = activeJobs.length > 0 
      ? Math.round(totalConversionRate / activeJobs.length) 
      : 0;

    // Get count of candidates hired this month
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const hiredThisMonth = await this.candidateRepository.count({
      where: {
        status: CandidateStatus.HIRED,
        hiredAt: MoreThanOrEqual(startOfMonth),
      },
    });

    return {
      totalCandidates,
      averageConversionRate,
      activeJobs: activeJobs.length,
      hiredThisMonth,
      jobs: pipelineJobs,
    };
  }

  async getInterviewCalendar(): Promise<InterviewStatsDto> {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);
    
    const weekEnd = new Date();
    weekEnd.setDate(weekEnd.getDate() + 7);
    weekEnd.setHours(23, 59, 59, 999);
    
    const [scheduled, completed, todayInterviews, thisWeekInterviews] = await Promise.all([
      this.interviewRepository.count({ where: { status: InterviewStatus.SCHEDULED } }),
      this.interviewRepository.count({ where: { status: InterviewStatus.COMPLETED } }),
      this.interviewRepository.find({
        where: {
          scheduledAt: Between(todayStart, todayEnd) as any,
          status: InterviewStatus.SCHEDULED,
        },
        relations: ['candidate', 'interviewer'],
        order: { scheduledAt: 'ASC' } as any,
      }),
      this.interviewRepository.find({
        where: {
          scheduledAt: Between(todayStart, weekEnd) as any,
          status: InterviewStatus.SCHEDULED,
        },
        relations: ['candidate', 'interviewer'],
        order: { scheduledAt: 'ASC' } as any,
      }),
    ]);

    const stats: InterviewStatsDto = {
      scheduled,
      completed,
      today: todayInterviews.length,
      thisWeek: thisWeekInterviews.length,
    };
    
    return stats;
  }
}
