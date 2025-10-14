import { Controller, Get, Post, Body, Param, UseGuards, Put, Delete, Query } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/enums/roles.enum';
import { RecruitmentService } from './recruitment.service';
import { CreateJobPostingDto } from './dto/create-job-posting.dto';
import { UpdateJobPostingDto } from './dto/update-job-posting.dto';
import { CreateCandidateDto } from './dto/create-candidate.dto';
import { UpdateCandidateDto } from './dto/update-candidate.dto';

@ApiTags('recruitment')
@Controller('recruitment')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@ApiBearerAuth()
@Roles(Role.ADMIN, Role.HR) 
export class RecruitmentController {
  constructor(private readonly recruitmentService: RecruitmentService) {}

  @Get('jobs')
  @ApiOperation({ summary: 'Get all job postings' })
  @ApiResponse({ status: 200, description: 'Return all job postings' })
  async findAllJobs() {
    return this.recruitmentService.findAllJobPostings();
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
  @ApiOperation({ summary: 'Get all candidates' })
  @ApiResponse({ status: 200, description: 'Return all candidates' })
  async findAllCandidates() {
    return this.recruitmentService.findAllCandidates();
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

  @Get('interviews/calendar')
  @ApiOperation({ summary: 'Get interview calendar' })
  @ApiResponse({ status: 200, description: 'Return interview calendar' })
  async getInterviewCalendar() {
    return this.recruitmentService.getInterviewCalendar();
  }

  @Get('interviews/stats')
  @ApiOperation({ summary: 'Get interview statistics' })
  @ApiResponse({ status: 200, description: 'Return interview statistics' })
  async getInterviewStats() {
    const { totalScheduled, completed, today, thisWeek } = await this.recruitmentService.getInterviewCalendar();
    return { totalScheduled, completed, today, thisWeek };
  }
}
