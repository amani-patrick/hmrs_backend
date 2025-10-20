import { IsString, IsNotEmpty, IsDateString, IsOptional, IsArray, IsNumber } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class EnrollBenefitDto {
  @ApiProperty({ example: 'benefit-plan-uuid' })
  @IsString()
  @IsNotEmpty()
  benefitPlanId: string;

  @ApiProperty({ example: '2024-01-01' })
  @IsDateString()
  effectiveDate: string;

  @ApiPropertyOptional({ example: 'family' })
  @IsString()
  @IsOptional()
  coverageLevel?: string;

  @ApiPropertyOptional({ example: 200 })
  @IsNumber()
  @IsOptional()
  employeeContribution?: number;

  @ApiPropertyOptional()
  @IsArray()
  @IsOptional()
  dependents?: {
    name: string;
    relationship: string;
    dateOfBirth: string;
  }[];
}
