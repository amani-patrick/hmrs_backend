import { PartialType } from '@nestjs/swagger';
import { CreateRiskAssessmentDto } from './create-risk-assessment.dto';
import { IsEnum, IsOptional, IsInt, Min, Max } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { RiskStatus } from '../entities/risk-assessment.entity';

export class UpdateRiskAssessmentDto extends PartialType(CreateRiskAssessmentDto) {
  @ApiPropertyOptional({ enum: RiskStatus })
  @IsEnum(RiskStatus)
  @IsOptional()
  status?: RiskStatus;

  @ApiPropertyOptional({ minimum: 1, maximum: 5 })
  @IsInt()
  @Min(1)
  @Max(5)
  @IsOptional()
  residualLikelihood?: number;

  @ApiPropertyOptional({ minimum: 1, maximum: 5 })
  @IsInt()
  @Min(1)
  @Max(5)
  @IsOptional()
  residualImpact?: number;
}
