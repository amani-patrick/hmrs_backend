import { PartialType } from '@nestjs/mapped-types';
import { CreateCandidateDto } from './create-candidate.dto';
import { IsOptional, IsUUID, IsString, IsEnum } from 'class-validator';

export class UpdateCandidateDto extends PartialType(CreateCandidateDto) {
  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsUUID()
  jobPostingId?: string;

  // Add any other update-specific fields here
}
