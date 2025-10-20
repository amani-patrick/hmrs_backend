import { IsString, IsNotEmpty, IsOptional, IsEnum, IsArray, IsNumber, IsBoolean, IsDateString, Min, Max } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ProgramType, ProgramStatus } from '../entities/training-program.entity';

export class CreateProgramDto {
  @ApiProperty({ example: 'New Employee Onboarding' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiPropertyOptional({ example: 'Comprehensive onboarding program for new hires' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ enum: ProgramType, example: ProgramType.ONBOARDING })
  @IsEnum(ProgramType)
  type: ProgramType;

  @ApiPropertyOptional({ enum: ProgramStatus, default: ProgramStatus.DRAFT })
  @IsEnum(ProgramStatus)
  @IsOptional()
  status?: ProgramStatus;

  @ApiPropertyOptional({ example: ['Understand company culture', 'Complete required training'] })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  objectives?: string[];

  @ApiPropertyOptional({ example: ['New Hires', 'Entry Level'] })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  targetAudience?: string[];

  @ApiPropertyOptional({ example: 40, description: 'Duration in hours' })
  @IsNumber()
  @Min(0)
  @IsOptional()
  duration?: number;

  @ApiPropertyOptional({ example: '2025-02-01' })
  @IsDateString()
  @IsOptional()
  startDate?: string;

  @ApiPropertyOptional({ example: '2025-03-01' })
  @IsDateString()
  @IsOptional()
  endDate?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  instructorId?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  instructorName?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  categoryId?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  categoryName?: string;

  @ApiPropertyOptional({ example: 70, description: 'Passing score percentage' })
  @IsNumber()
  @Min(0)
  @Max(100)
  @IsOptional()
  passingScore?: number;

  @ApiPropertyOptional({ default: false })
  @IsBoolean()
  @IsOptional()
  isMandatory?: boolean;

  @ApiPropertyOptional({ default: false })
  @IsBoolean()
  @IsOptional()
  isRecurring?: boolean;

  @ApiPropertyOptional({ example: 'yearly' })
  @IsString()
  @IsOptional()
  recurringInterval?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  thumbnailUrl?: string;

  @ApiPropertyOptional({ example: ['onboarding', 'compliance'] })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tags?: string[];

  @ApiPropertyOptional({ example: [] })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  prerequisites?: string[];

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  certificateTemplateId?: string;
}
