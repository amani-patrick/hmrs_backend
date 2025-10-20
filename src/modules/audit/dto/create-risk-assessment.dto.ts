import { IsString, IsNotEmpty, IsEnum, IsOptional, IsArray, IsInt, Min, Max, IsDateString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { RiskCategory, RiskLevel } from '../entities/risk-assessment.entity';

export class CreateRiskAssessmentDto {
  @ApiProperty({ example: 'Data Breach Risk' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ example: 'Risk of unauthorized access to sensitive employee data' })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({ enum: RiskCategory, example: RiskCategory.SECURITY })
  @IsEnum(RiskCategory)
  category: RiskCategory;

  @ApiProperty({ enum: RiskLevel, example: RiskLevel.HIGH })
  @IsEnum(RiskLevel)
  riskLevel: RiskLevel;

  @ApiProperty({ example: 4, minimum: 1, maximum: 5, description: 'Likelihood scale 1-5' })
  @IsInt()
  @Min(1)
  @Max(5)
  likelihood: number;

  @ApiProperty({ example: 5, minimum: 1, maximum: 5, description: 'Impact scale 1-5' })
  @IsInt()
  @Min(1)
  @Max(5)
  impact: number;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  potentialImpact?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  currentControls?: string;

  @ApiProperty()
  @IsArray()
  mitigationActions: Array<{
    id: string;
    action: string;
    responsiblePersonId?: string;
    dueDate?: string;
    status: 'pending' | 'in_progress' | 'completed';
  }>;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  ownerId?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  departmentId?: string;

  @ApiPropertyOptional({ example: '2025-01-15' })
  @IsDateString()
  @IsOptional()
  identifiedDate?: string;

  @ApiPropertyOptional({ example: '2025-04-15' })
  @IsDateString()
  @IsOptional()
  nextReviewDate?: string;

  @ApiPropertyOptional({ example: ['security', 'critical'] })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tags?: string[];
}
