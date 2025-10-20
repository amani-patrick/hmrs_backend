import { IsString, IsNotEmpty, IsEnum, IsDateString, IsOptional, IsArray, IsNumber, Min, Max } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ReviewType, OverallRating } from '../entities/performance-review.entity';

export class CreateReviewDto {
  @ApiProperty({ example: 'employee-uuid' })
  @IsString()
  @IsNotEmpty()
  employeeId: string;

  @ApiProperty({ example: 'reviewer-uuid' })
  @IsString()
  @IsNotEmpty()
  reviewerId: string;

  @ApiProperty({ enum: ReviewType, example: ReviewType.ANNUAL })
  @IsEnum(ReviewType)
  reviewType: ReviewType;

  @ApiProperty({ example: '2025-01-01' })
  @IsDateString()
  reviewPeriodStart: string;

  @ApiProperty({ example: '2025-12-31' })
  @IsDateString()
  reviewPeriodEnd: string;

  @ApiPropertyOptional({ example: '2025-02-15' })
  @IsDateString()
  @IsOptional()
  dueDate?: string;

  @ApiPropertyOptional({ enum: OverallRating })
  @IsEnum(OverallRating)
  @IsOptional()
  overallRating?: OverallRating;

  @ApiPropertyOptional({ example: 4.5, minimum: 0, maximum: 5 })
  @IsNumber()
  @Min(0)
  @Max(5)
  @IsOptional()
  overallScore?: number;

  @ApiPropertyOptional()
  @IsArray()
  @IsOptional()
  competencies?: Array<{
    name: string;
    category: string;
    rating: number;
    comments?: string;
  }>;

  @ApiPropertyOptional()
  @IsArray()
  @IsOptional()
  goals?: Array<{
    goalId?: string;
    title: string;
    achievement: number;
    comments?: string;
  }>;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  strengths?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  areasForImprovement?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  achievements?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  developmentPlan?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  reviewerComments?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  employeeComments?: string;
}
