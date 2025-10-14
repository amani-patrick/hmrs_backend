
import { IsString, IsNotEmpty, IsOptional, IsNumber, IsUUID, IsEnum, IsBoolean, IsUrl, IsObject, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { JobStatus } from '../../../common/enums/job-status.enum';
import { JobPostingLocation } from '../../../common/enums/job-location.enum';

class ExternalPlatformDetailsDto {
  @IsString()
  @IsNotEmpty()
  platformName: string;

  @IsUrl()
  @IsOptional()
  url?: string;

  @IsString()
  @IsOptional()
  postingId?: string;

  @IsUrl()
  @IsOptional()
  applicationUrl?: string;
}

export class CreateJobPostingDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  keyRequirements: string;

  @IsOptional()
  details?: any;

  @IsEnum(JobStatus)
  @IsOptional()
  status?: JobStatus = JobStatus.DRAFT;

  @IsEnum(JobPostingLocation)
  @IsOptional()
  postingLocation?: JobPostingLocation = JobPostingLocation.INTERNAL;

  @IsObject()
  @ValidateNested()
  @Type(() => ExternalPlatformDetailsDto)
  @IsOptional()
  externalPlatformDetails?: ExternalPlatformDetailsDto;

  @IsNumber()
  @IsNotEmpty()
  minSalary: number;

  @IsNumber()
  @IsNotEmpty()
  maxSalary: number;

  @IsBoolean()
  @IsOptional()
  isRemote?: boolean = false;

  @IsString()
  @IsOptional()
  location?: string;

  @IsUUID()
  @IsNotEmpty()
  hiringManagerId: string;
}