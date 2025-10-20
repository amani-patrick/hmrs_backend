import { IsString, IsNotEmpty, IsEnum, IsOptional, IsArray, IsBoolean } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ReportType, ReportCategory, ReportFormat } from '../entities/report-template.entity';

export class CreateReportTemplateDto {
  @ApiProperty({ example: 'Employee Demographics Report' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({ example: 'Comprehensive workforce demographics analysis' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ enum: ReportType, example: ReportType.ANALYTICS })
  @IsEnum(ReportType)
  type: ReportType;

  @ApiProperty({ enum: ReportCategory, example: ReportCategory.WORKFORCE })
  @IsEnum(ReportCategory)
  category: ReportCategory;

  @ApiPropertyOptional({ enum: ReportFormat, default: ReportFormat.PDF })
  @IsEnum(ReportFormat)
  @IsOptional()
  defaultFormat?: ReportFormat;

  @ApiProperty({
    example: {
      entities: ['User', 'Department'],
      filters: { isActive: true },
    },
  })
  dataSource: {
    entities: string[];
    filters?: Record<string, any>;
    aggregations?: Record<string, any>;
  };

  @ApiPropertyOptional()
  @IsArray()
  @IsOptional()
  columns?: Array<{
    field: string;
    label: string;
    type: string;
    format?: string;
  }>;

  @ApiPropertyOptional()
  @IsArray()
  @IsOptional()
  parameters?: Array<{
    name: string;
    label: string;
    type: 'string' | 'number' | 'date' | 'boolean' | 'select';
    required: boolean;
    defaultValue?: any;
    options?: Array<{ label: string; value: any }>;
  }>;

  @ApiPropertyOptional()
  @IsOptional()
  chartConfig?: {
    enabled: boolean;
    type?: 'bar' | 'line' | 'pie' | 'area';
    xAxis?: string;
    yAxis?: string;
  };

  @ApiPropertyOptional({ default: true })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  permissions?: {
    roles: string[];
    departments?: string[];
  };
}
