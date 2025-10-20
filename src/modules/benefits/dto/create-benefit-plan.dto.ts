import { IsString, IsNotEmpty, IsEnum, IsOptional, IsNumber, IsBoolean, IsDateString, IsArray } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { BenefitType, CoverageLevel } from '../entities/benefit-plan.entity';

export class CreateBenefitPlanDto {
  @ApiProperty({ example: 'Premium Health Insurance' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({ example: 'Comprehensive health coverage' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ enum: BenefitType, example: BenefitType.HEALTH_INSURANCE })
  @IsEnum(BenefitType)
  type: BenefitType;

  @ApiProperty({ example: 'Blue Cross Blue Shield' })
  @IsString()
  @IsNotEmpty()
  provider: string;

  @ApiPropertyOptional({ example: 500 })
  @IsNumber()
  @IsOptional()
  employerContribution?: number;

  @ApiPropertyOptional({ example: 200 })
  @IsNumber()
  @IsOptional()
  employeeContribution?: number;

  @ApiPropertyOptional({ example: 700 })
  @IsNumber()
  @IsOptional()
  totalCost?: number;

  @ApiPropertyOptional()
  @IsArray()
  @IsOptional()
  coverageLevels?: { level: CoverageLevel; cost: number }[];

  @ApiPropertyOptional({ default: true })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @ApiPropertyOptional({ example: '2024-01-01' })
  @IsDateString()
  @IsOptional()
  enrollmentStartDate?: string;

  @ApiPropertyOptional({ example: '2024-12-31' })
  @IsDateString()
  @IsOptional()
  enrollmentEndDate?: string;
}
