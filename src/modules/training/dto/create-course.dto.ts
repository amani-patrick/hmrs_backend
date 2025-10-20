import { IsString, IsNotEmpty, IsOptional, IsEnum, IsArray, IsNumber, IsBoolean, Min, Max } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CourseStatus, CourseLevel, DeliveryMode } from '../entities/course.entity';

export class CreateCourseDto {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  programId?: string;

  @ApiProperty({ example: 'Introduction to Company Policies' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiPropertyOptional({ example: 'Learn about our company policies and procedures' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ enum: CourseStatus, default: CourseStatus.DRAFT })
  @IsEnum(CourseStatus)
  @IsOptional()
  status?: CourseStatus;

  @ApiProperty({ enum: CourseLevel, example: CourseLevel.BEGINNER })
  @IsEnum(CourseLevel)
  level: CourseLevel;

  @ApiProperty({ enum: DeliveryMode, example: DeliveryMode.ONLINE })
  @IsEnum(DeliveryMode)
  deliveryMode: DeliveryMode;

  @ApiPropertyOptional({ example: 2, description: 'Duration in hours' })
  @IsNumber()
  @Min(0)
  @IsOptional()
  duration?: number;

  @ApiPropertyOptional({ example: ['Understand policies', 'Apply procedures'] })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  learningObjectives?: string[];

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

  @ApiPropertyOptional({ example: 70 })
  @IsNumber()
  @Min(0)
  @Max(100)
  @IsOptional()
  passingScore?: number;

  @ApiPropertyOptional({ example: 3 })
  @IsNumber()
  @Min(1)
  @IsOptional()
  maxAttempts?: number;

  @ApiPropertyOptional({ default: false })
  @IsBoolean()
  @IsOptional()
  hasCertificate?: boolean;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  certificateTemplateId?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  thumbnailUrl?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  videoUrl?: string;

  @ApiPropertyOptional({ example: ['compliance', 'required'] })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tags?: string[];

  @ApiPropertyOptional()
  @IsArray()
  @IsOptional()
  prerequisites?: string[];

  @ApiPropertyOptional()
  @IsArray()
  @IsOptional()
  resources?: Array<{ name: string; type: string; url: string }>;

  @ApiPropertyOptional({ default: false })
  @IsBoolean()
  @IsOptional()
  isFeatured?: boolean;
}
