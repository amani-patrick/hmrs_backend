import { IsString, IsNotEmpty, IsEnum, IsOptional, IsArray, IsInt, Min, Max } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ScheduleFrequency } from '../entities/scheduled-report.entity';
import { ReportFormat } from '../entities/report-template.entity';

export class CreateScheduledReportDto {
  @ApiProperty({ example: 'template-uuid' })
  @IsString()
  @IsNotEmpty()
  templateId: string;

  @ApiProperty({ example: 'Monthly Payroll Report' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ enum: ScheduleFrequency, example: ScheduleFrequency.MONTHLY })
  @IsEnum(ScheduleFrequency)
  frequency: ScheduleFrequency;

  @ApiProperty({ enum: ReportFormat, example: ReportFormat.PDF })
  @IsEnum(ReportFormat)
  format: ReportFormat;

  @ApiPropertyOptional()
  @IsOptional()
  parameters?: Record<string, any>;

  @ApiPropertyOptional()
  @IsOptional()
  filters?: Record<string, any>;

  @ApiPropertyOptional({ example: '09:00:00' })
  @IsString()
  @IsOptional()
  scheduleTime?: string;

  @ApiPropertyOptional({ example: 1, description: 'Day of week (0-6, 0=Sunday)', minimum: 0, maximum: 6 })
  @IsInt()
  @Min(0)
  @Max(6)
  @IsOptional()
  dayOfWeek?: number;

  @ApiPropertyOptional({ example: 1, description: 'Day of month (1-31)', minimum: 1, maximum: 31 })
  @IsInt()
  @Min(1)
  @Max(31)
  @IsOptional()
  dayOfMonth?: number;

  @ApiPropertyOptional({
    example: [
      { email: 'manager@company.com', name: 'John Manager' },
      { email: 'hr@company.com', name: 'HR Team' },
    ],
  })
  @IsArray()
  @IsOptional()
  recipients?: Array<{
    email: string;
    name?: string;
  }>;
}
