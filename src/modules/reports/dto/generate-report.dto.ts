import { IsString, IsNotEmpty, IsEnum, IsOptional, IsDateString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ReportFormat } from '../entities/report-template.entity';

export class GenerateReportDto {
  @ApiProperty({ example: 'template-uuid' })
  @IsString()
  @IsNotEmpty()
  templateId: string;

  @ApiPropertyOptional({ example: 'Q4 2024 Employee Report' })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({ example: 'Custom description for this report' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ enum: ReportFormat })
  @IsEnum(ReportFormat)
  @IsOptional()
  format?: ReportFormat;

  @ApiPropertyOptional({
    example: {
      startDate: '2024-01-01',
      endDate: '2024-12-31',
      departmentId: 'dept-uuid',
    },
  })
  @IsOptional()
  filters?: {
    startDate?: string;
    endDate?: string;
    departmentId?: string;
    employeeId?: string;
    [key: string]: any;
  };

  @ApiPropertyOptional({
    example: {
      includeCharts: true,
      showDetails: false,
    },
  })
  @IsOptional()
  parameters?: Record<string, any>;
}
