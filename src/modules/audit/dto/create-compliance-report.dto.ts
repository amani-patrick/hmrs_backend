import { IsString, IsNotEmpty, IsEnum, IsDateString, IsOptional, IsArray, IsNumber, IsBoolean, Min, Max } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ComplianceType, ComplianceStatus } from '../entities/compliance-report.entity';

export class CreateComplianceReportDto {
  @ApiProperty({ example: 'GDPR Compliance Audit Q1 2025' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiPropertyOptional({ example: 'Quarterly GDPR compliance assessment' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ enum: ComplianceType, example: ComplianceType.GDPR })
  @IsEnum(ComplianceType)
  complianceType: ComplianceType;

  @ApiProperty({ enum: ComplianceStatus, example: ComplianceStatus.COMPLIANT })
  @IsEnum(ComplianceStatus)
  status: ComplianceStatus;

  @ApiProperty({ example: '2025-01-31' })
  @IsDateString()
  reportDate: string;

  @ApiPropertyOptional({ example: '2025-04-30' })
  @IsDateString()
  @IsOptional()
  nextReviewDate?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  departmentId?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  responsiblePersonId?: string;

  @ApiProperty()
  @IsArray()
  findings: Array<{
    id: string;
    category: string;
    description: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    status: 'open' | 'in_progress' | 'resolved';
    remediation?: string;
  }>;

  @ApiPropertyOptional()
  @IsOptional()
  metrics?: Record<string, number>;

  @ApiPropertyOptional({ example: 95.5, minimum: 0, maximum: 100 })
  @IsNumber()
  @Min(0)
  @Max(100)
  @IsOptional()
  complianceScore?: number;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  recommendations?: string;

  @ApiPropertyOptional()
  @IsArray()
  @IsOptional()
  documents?: Array<{ name: string; url: string; type: string }>;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  auditorId?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  auditorName?: string;

  @ApiPropertyOptional({ default: false })
  @IsBoolean()
  @IsOptional()
  isPublished?: boolean;
}
