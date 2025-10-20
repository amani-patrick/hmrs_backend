import { IsString, IsNotEmpty, IsEnum, IsOptional, IsArray, IsBoolean, IsDateString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ViolationType, ViolationSeverity } from '../entities/policy-violation.entity';

export class CreatePolicyViolationDto {
  @ApiProperty({ example: 'employee-uuid' })
  @IsString()
  @IsNotEmpty()
  employeeId: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  reportedBy?: string;

  @ApiProperty({ enum: ViolationType, example: ViolationType.CODE_OF_CONDUCT })
  @IsEnum(ViolationType)
  violationType: ViolationType;

  @ApiProperty({ enum: ViolationSeverity, example: ViolationSeverity.MODERATE })
  @IsEnum(ViolationSeverity)
  severity: ViolationSeverity;

  @ApiProperty({ example: '2025-01-15' })
  @IsDateString()
  incidentDate: string;

  @ApiProperty({ example: 'Description of the policy violation' })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiPropertyOptional({ example: 'Employee Handbook Section 4.2' })
  @IsString()
  @IsOptional()
  policyReference?: string;

  @ApiPropertyOptional({ default: false })
  @IsBoolean()
  @IsOptional()
  isConfidential?: boolean;

  @ApiPropertyOptional()
  @IsArray()
  @IsOptional()
  evidence?: Array<{ type: string; url?: string; description: string }>;
}
