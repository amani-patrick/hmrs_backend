import { ApiProperty } from '@nestjs/swagger';

export class HiringPipelineStageDto {
  @ApiProperty({ description: 'Name of the pipeline stage' })
  name: string;

  @ApiProperty({ description: 'Number of candidates in this stage' })
  count: number;

  @ApiProperty({ description: 'Percentage of candidates that moved to the next stage' })
  conversionRate?: number;
}

export class HiringPipelineJobDto {
  @ApiProperty({ description: 'Job posting ID' })
  jobId: string;

  @ApiProperty({ description: 'Job title' })
  title: string;

  @ApiProperty({ description: 'Total number of candidates for this job' })
  totalCandidates: number;

  @ApiProperty({ type: [HiringPipelineStageDto], description: 'Pipeline stages with candidate counts' })
  stages: HiringPipelineStageDto[];
}

export class HiringPipelineResponseDto {
  @ApiProperty({ description: 'Total number of candidates in the pipeline' })
  totalCandidates: number;

  @ApiProperty({ description: 'Average conversion rate across all jobs' })
  averageConversionRate: number;

  @ApiProperty({ description: 'Number of active job postings' })
  activeJobs: number;

  @ApiProperty({ description: 'Number of candidates hired this month' })
  hiredThisMonth: number;

  @ApiProperty({ type: [HiringPipelineJobDto], description: 'Pipeline data for each job' })
  jobs: HiringPipelineJobDto[];
}
