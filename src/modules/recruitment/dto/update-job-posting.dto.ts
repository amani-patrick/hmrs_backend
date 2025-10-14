import { PartialType } from '@nestjs/mapped-types';
import { CreateJobPostingDto } from './create-job-posting.dto';
import { JobStatus } from '../../../common/enums/job-status.enum';
import { JobPostingLocation } from '../../../common/enums/job-location.enum';
import { IsOptional, IsEnum } from 'class-validator';

export class UpdateJobPostingDto extends PartialType(CreateJobPostingDto) {
  @IsOptional()
  @IsEnum(JobStatus)
  status?: JobStatus;

  @IsOptional()
  @IsEnum(JobPostingLocation)
  postingLocation?: JobPostingLocation;

}
