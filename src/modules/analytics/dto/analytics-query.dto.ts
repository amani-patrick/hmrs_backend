import { IsString, IsOptional, IsEnum, IsDateString, IsObject } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum TimeRange {
  TODAY = 'today',
  YESTERDAY = 'yesterday',
  THIS_WEEK = 'this_week',
  LAST_WEEK = 'last_week',
  THIS_MONTH = 'this_month',
  LAST_MONTH = 'last_month',
  THIS_QUARTER = 'this_quarter',
  LAST_QUARTER = 'last_quarter',
  THIS_YEAR = 'this_year',
  LAST_YEAR = 'last_year',
  CUSTOM = 'custom',
}

export enum GroupBy {
  DAY = 'day',
  WEEK = 'week',
  MONTH = 'month',
  QUARTER = 'quarter',
  YEAR = 'year',
  DEPARTMENT = 'department',
  POSITION = 'position',
  EMPLOYEE = 'employee',
}

export class AnalyticsQueryDto {
  @ApiPropertyOptional({ enum: TimeRange, description: 'Predefined time range' })
  @IsEnum(TimeRange)
  @IsOptional()
  timeRange?: TimeRange;

  @ApiPropertyOptional({ description: 'Custom start date (ISO format)' })
  @IsDateString()
  @IsOptional()
  startDate?: string;

  @ApiPropertyOptional({ description: 'Custom end date (ISO format)' })
  @IsDateString()
  @IsOptional()
  endDate?: string;

  @ApiPropertyOptional({ enum: GroupBy, description: 'Group by dimension' })
  @IsEnum(GroupBy)
  @IsOptional()
  groupBy?: GroupBy;

  @ApiPropertyOptional({ description: 'Department filter' })
  @IsString()
  @IsOptional()
  departmentId?: string;

  @ApiPropertyOptional({ description: 'Position filter' })
  @IsString()
  @IsOptional()
  positionId?: string;

  @ApiPropertyOptional({ description: 'Additional filters' })
  @IsObject()
  @IsOptional()
  filters?: any;
}
