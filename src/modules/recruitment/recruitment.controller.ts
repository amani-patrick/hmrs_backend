import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  Query,
  UseGuards,
  Req,
  ParseIntPipe,
  NotFoundException,
  Req as Request
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import {
  ApiTags,
  ApiOperation,
  ApiResponse, 
  ApiBearerAuth, 
  ApiQuery,
  ApiParam 
} from '@nestjs/swagger';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/enums/roles.enum';
import { RecruitmentService } from './recruitment.service';
import { CandidateStatus } from './entities/candidate.entity';
import { InterviewStatus } from './entities/interview.entity';
import { CreateJobPostingDto } from './dto/create-job-posting.dto';
import { UpdateJobPostingDto } from './dto/update-job-posting.dto';
import { CreateCandidateDto } from './dto/create-candidate.dto';
import { UpdateCandidateDto } from './dto/update-candidate.dto';
import { CreateInterviewDto, UpdateInterviewDto } from './dto/interview.dto';
import { RecruitmentStatsResponseDto } from './dto/recruitment-stats.dto';
import { HiringPipelineResponseDto } from './dto/hiring-pipeline-response.dto';

@ApiTags('recruitment')
@Controller('recruitment')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@ApiBearerAuth()
@Roles(Role.ADMIN, Role.HR, Role.MANAGER)
export class RecruitmentController {
  constructor(private readonly recruitmentService: RecruitmentService) {}

  @Get('jobs')
  @ApiOperation({ summary: 'Get all job postings with optional filters' })
  @ApiResponse({ status: 200, description: 'Return filtered job postings' })
  @ApiQuery({ name: 'status', required: false, enum: ['draft', 'published', 'closed'] })
  @ApiQuery({ name: 'isFeatured', required: false, type: Boolean })
  @ApiQuery({ name: 'employmentType', required: false, enum: ['full_time', 'part_time', 'contract', 'temporary', 'internship', 'volunteer'] })
  @ApiQuery({ name: 'location', required: false, type: String })
  @ApiQuery({ name: 'search', required: false, type: String })
  async findAllJobs(
    @Query('status') status?: string,
    @Query('isFeatured') isFeatured?: boolean,
    @Query('employmentType') employmentType?: string,
    @Query('location') location?: string,
    @Query('search') search?: string,
  ) {
    return this.recruitmentService.findAllJobPostings({
      status: status as any,
      isFeatured,
      employmentType: employmentType as any,
      location,
      search,
    });
  }

  @Get('jobs/:id')
  @ApiOperation({ summary: 'Get job posting by ID' })
  @ApiResponse({ status: 200, description: 'Return job posting by ID' })
  @ApiResponse({ status: 404, description: 'Job posting not found' })
  async findJobById(@Param('id') id: string) {
    return this.recruitmentService.findJobPostingById(id);
  }

  @Post('jobs')
  @ApiOperation({ summary: 'Create a new job posting' })
  @ApiResponse({ status: 201, description: 'Job posting created successfully' })
  async createJob(@Body() createJobPostingDto: CreateJobPostingDto) {
    return this.recruitmentService.createJobPosting(createJobPostingDto);
  }

  @Put('jobs/:id')
  @ApiOperation({ summary: 'Update a job posting' })
  @ApiResponse({ status: 200, description: 'Job posting updated successfully' })
  @ApiResponse({ status: 404, description: 'Job posting not found' })
  async updateJob(
    @Param('id') id: string,
    @Body() updateJobPostingDto: UpdateJobPostingDto,
  ) {
    return this.recruitmentService.updateJobPosting(id, updateJobPostingDto);
  }

  @Delete('jobs/:id')
  @ApiOperation({ summary: 'Delete a job posting' })
  @ApiResponse({ status: 200, description: 'Job posting deleted successfully' })
  @ApiResponse({ status: 404, description: 'Job posting not found' })
  async removeJob(@Param('id') id: string) {
    return this.recruitmentService.removeJobPosting(id);
  }

  @Get('jobs/stats')
  @ApiOperation({ summary: 'Get job posting statistics' })
  @ApiResponse({ status: 200, description: 'Return job posting statistics' })
  async getJobStats() {
    return this.recruitmentService.getJobPostingStats();
  }

  @Get('candidates')
  @ApiOperation({ summary: 'Get all candidates with optional filters' })
  @ApiResponse({ status: 200, description: 'Return filtered candidates' })
  @ApiQuery({ name: 'status', required: false, enum: CandidateStatus })
  @ApiQuery({ name: 'jobPostingId', required: false, type: String })
  @ApiQuery({ name: 'search', required: false, type: String })
  async findAllCandidates(
    @Query('status') status?: CandidateStatus,
    @Query('jobPostingId') jobPostingId?: string,
    @Query('search') search?: string,
  ) {
    return this.recruitmentService.findAllCandidates({
      status,
      jobPostingId,
      search,
    });
  }

  @Get('candidates/:id')
  @ApiOperation({ summary: 'Get candidate by ID' })
  @ApiResponse({ status: 200, description: 'Return candidate by ID' })
  @ApiResponse({ status: 404, description: 'Candidate not found' })
  async findCandidateById(@Param('id') id: string) {
    return this.recruitmentService.findCandidateById(id);
  }

  @Post('candidates')
  @ApiOperation({ summary: 'Create a new candidate' })
  @ApiResponse({ status: 201, description: 'Candidate created successfully' })
  async createCandidate(@Body() createCandidateDto: CreateCandidateDto) {
    return this.recruitmentService.createCandidate(createCandidateDto);
  }

  @Put('candidates/:id')
  @ApiOperation({ summary: 'Update a candidate' })
  @ApiResponse({ status: 200, description: 'Candidate updated successfully' })
  @ApiResponse({ status: 404, description: 'Candidate not found' })
  async updateCandidate(
    @Param('id') id: string,
    @Body() updateCandidateDto: UpdateCandidateDto,
  ) {
    return this.recruitmentService.updateCandidate(id, updateCandidateDto);
  }

  @Put('candidates/:id/status')
  @ApiOperation({ summary: 'Update candidate status' })
  @ApiResponse({ status: 200, description: 'Candidate status updated' })
  @ApiResponse({ status: 404, description: 'Candidate not found' })
  async updateCandidateStatus(
    @Param('id') id: string,
    @Body('status') status: string,
  ) {
    return this.recruitmentService.updateCandidateStatus(id, status);
  }

  @Delete('candidates/:id')
  @ApiOperation({ summary: 'Delete a candidate' })
  @ApiResponse({ status: 200, description: 'Candidate deleted successfully' })
  @ApiResponse({ status: 404, description: 'Candidate not found' })
  async removeCandidate(@Param('id') id: string) {
    return this.recruitmentService.removeCandidate(id);
  }

  @Get('candidates/stats')
  @ApiOperation({ summary: 'Get candidate statistics' })
  @ApiResponse({ status: 200, description: 'Return candidate statistics' })
  async getCandidateStats() {
    return this.recruitmentService.getCandidateStats();
  }

  // ========== Interview Endpoints ==========
  @Post('interviews')
  @ApiOperation({ summary: 'Schedule a new interview' })
  @ApiResponse({ status: 201, description: 'Interview scheduled successfully' })
  @ApiResponse({ status: 400, description: 'Invalid interview data' })
  @ApiResponse({ status: 404, description: 'Candidate or interviewer not found' })
  async scheduleInterview(@Body() createInterviewDto: CreateInterviewDto) {
    return this.recruitmentService.scheduleInterview(createInterviewDto);
  }

  @Get('interviews')
  @ApiOperation({ summary: 'Get interviews with optional filters' })
  @ApiResponse({ status: 200, description: 'Return filtered interviews' })
  @ApiQuery({ name: 'status', required: false, enum: InterviewStatus })
  @ApiQuery({ name: 'candidateId', required: false, type: String })
  @ApiQuery({ name: 'interviewerId', required: false, type: String })
  @ApiQuery({ name: 'startDate', required: false, type: Date })
  @ApiQuery({ name: 'endDate', required: false, type: Date })
  async getInterviews(
    @Query('status') status?: InterviewStatus,
    @Query('candidateId') candidateId?: string,
    @Query('interviewerId') interviewerId?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.recruitmentService.getInterviews({
      status,
      candidateId,
      interviewerId,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
    });
  }

  @Get('interviews/:id')
  @ApiOperation({ summary: 'Get interview by ID' })
  @ApiResponse({ status: 200, description: 'Return interview details' })
  @ApiResponse({ status: 404, description: 'Interview not found' })
  async getInterviewById(@Param('id') id: string) {
    const interview = await this.recruitmentService.findInterviewById(id);
    if (!interview) {
      throw new NotFoundException(`Interview with ID ${id} not found`);
    }
    return interview;
  }

  @Put('interviews/:id')
  @ApiOperation({ summary: 'Update an interview' })
  @ApiResponse({ status: 200, description: 'Interview updated successfully' })
  @ApiResponse({ status: 400, description: 'Invalid interview data' })
  @ApiResponse({ status: 404, description: 'Interview not found' })
  async updateInterview(
    @Param('id') id: string,
    @Body() updateInterviewDto: UpdateInterviewDto,
  ) {
    return this.recruitmentService.updateInterview(id, updateInterviewDto);
  }

  @Get('interviews/calendar')
  @ApiOperation({ summary: 'Get interview calendar' })
  @ApiResponse({ status: 200, description: 'Return interview calendar' })
  @ApiQuery({ name: 'startDate', required: false, type: Date })
  @ApiQuery({ name: 'endDate', required: false, type: Date })
  async getInterviewCalendar(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.recruitmentService.getInterviews({
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
    });
  }

  @Get('interviews/stats')
  @ApiOperation({ summary: 'Get interview statistics' })
  @ApiResponse({ status: 200, description: 'Return interview statistics' })
  async getInterviewStats() {
    const interviews = await this.recruitmentService.getInterviews({});
    const now = new Date();
    const startOfDay = new Date(now.setHours(0, 0, 0, 0));
    const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
    
    return {
      scheduled: interviews.filter(i => i.status === InterviewStatus.SCHEDULED).length,
      completed: interviews.filter(i => i.status === InterviewStatus.COMPLETED).length,
      today: interviews.filter(i => 
        i.status === InterviewStatus.SCHEDULED && 
        new Date(i.scheduledAt) >= startOfDay
      ).length,
      thisWeek: interviews.filter(i => 
        i.status === InterviewStatus.SCHEDULED && 
        new Date(i.scheduledAt) >= startOfWeek
      ).length,
    };
  }

  // ========== Analytics Endpoints ==========
  @Get('analytics/stats')
  @ApiOperation({ summary: 'Get recruitment statistics' })
  @ApiResponse({ 
    status: 200, 
    description: 'Return recruitment statistics',
    type: RecruitmentStatsResponseDto,
  })
  async getRecruitmentStats(): Promise<RecruitmentStatsResponseDto> {
    return this.recruitmentService.getRecruitmentStats();
  }

  @Get('analytics/pipeline')
  @ApiOperation({ summary: 'Get hiring pipeline data' })
  @ApiResponse({ 
    status: 200, 
    description: 'Return hiring pipeline data',
    type: HiringPipelineResponseDto,
  })
  async getHiringPipeline(): Promise<HiringPipelineResponseDto> {
    return this.recruitmentService.getHiringPipeline();
  }
}
