import { PartialType } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';
import { CreateJobPostingDto } from './create-job-posting.dto';
import { JobStatus } from '../enums/job-status.enum';
import { JobPostingLocation } from '../../../common/enums/job-location.enum';

export class UpdateJobPostingDto extends PartialType(CreateJobPostingDto) {
  @IsOptional()
  @IsEnum(JobStatus)
  status?: JobStatus;

  @IsOptional()
  @IsEnum(JobPostingLocation)
  postingLocation?: JobPostingLocation;

  publishedAt?: Date;
  closedAt?: Date;
}