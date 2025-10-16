import { ApiProperty } from '@nestjs/swagger';

export class JobPostingStatsDto {
  @ApiProperty({ description: 'Total number of job postings' })
  total: number;

  @ApiProperty({ description: 'Number of active job postings' })
  active: number;

  @ApiProperty({ description: 'Number of draft job postings' })
  draft: number;

  @ApiProperty({ description: 'Number of closed job postings' })
  closed: number;
}

export class CandidateStatsDto {
  @ApiProperty({ description: 'Total number of candidates' })
  total: number;

  @ApiProperty({ description: 'Number of new candidates' })
  new: number;

  @ApiProperty({ description: 'Number of candidates in screening' })
  screening: number;

  @ApiProperty({ description: 'Number of candidates in interview process' })
  interview: number;

  @ApiProperty({ description: 'Number of candidates who received offers' })
  offer: number;

  @ApiProperty({ description: 'Number of hired candidates' })
  hired: number;

  @ApiProperty({ description: 'Number of rejected candidates' })
  rejected: number;
}

export class InterviewStatsDto {
  @ApiProperty({ description: 'Number of scheduled interviews' })
  scheduled: number;

  @ApiProperty({ description: 'Number of completed interviews' })
  completed: number;

  @ApiProperty({ description: 'Number of interviews scheduled for today' })
  today: number;

  @ApiProperty({ description: 'Number of interviews scheduled for this week' })
  thisWeek: number;
}

export class RecruitmentStatsResponseDto {
  @ApiProperty({ type: JobPostingStatsDto })
  jobPostings: JobPostingStatsDto;

  @ApiProperty({ type: CandidateStatsDto })
  candidates: CandidateStatsDto;

  @ApiProperty({ type: InterviewStatsDto })
  interviews: InterviewStatsDto;

  @ApiProperty({ description: 'Average time to hire in days', required: false })
  averageTimeToHire?: number;

  @ApiProperty({ description: 'Offer acceptance rate (0-100)', required: false })
  offerAcceptanceRate?: number;

  @ApiProperty({ description: 'Date when the statistics were last updated' })
  lastUpdated: Date;
}
