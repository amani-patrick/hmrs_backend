import { IsString, IsNotEmpty, IsOptional, IsBoolean, IsDateString, IsArray } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateEnrollmentDto {
  @ApiProperty({ example: 'user-uuid' })
  @IsString()
  @IsNotEmpty()
  learnerId: string;

  @ApiPropertyOptional({ description: 'Course ID (required if programId not provided)' })
  @IsString()
  @IsOptional()
  courseId?: string;

  @ApiPropertyOptional({ description: 'Program ID (required if courseId not provided)' })
  @IsString()
  @IsOptional()
  programId?: string;

  @ApiPropertyOptional({ example: '2025-03-01' })
  @IsDateString()
  @IsOptional()
  dueDate?: string;

  @ApiPropertyOptional({ default: false })
  @IsBoolean()
  @IsOptional()
  isMandatory?: boolean;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  assignedBy?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  notes?: string;
}

export class BulkEnrollmentDto {
  @ApiProperty({ example: ['user-uuid-1', 'user-uuid-2'] })
  @IsArray()
  @IsString({ each: true })
  @IsNotEmpty({ each: true })
  learnerIds: string[];

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  courseId?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  programId?: string;

  @ApiPropertyOptional({ example: '2025-03-01' })
  @IsDateString()
  @IsOptional()
  dueDate?: string;

  @ApiPropertyOptional({ default: false })
  @IsBoolean()
  @IsOptional()
  isMandatory?: boolean;
}
