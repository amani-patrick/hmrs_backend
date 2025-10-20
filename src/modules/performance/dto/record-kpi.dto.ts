import { IsString, IsNotEmpty, IsDateString, IsNumber, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class RecordKpiDto {
  @ApiProperty({ example: 'kpi-uuid' })
  @IsString()
  @IsNotEmpty()
  kpiId: string;

  @ApiPropertyOptional({ example: 'employee-uuid' })
  @IsString()
  @IsOptional()
  employeeId?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  departmentId?: string;

  @ApiProperty({ example: '2025-01-31' })
  @IsDateString()
  recordDate: string;

  @ApiProperty({ example: 85.5 })
  @IsNumber()
  actualValue: number;

  @ApiPropertyOptional({ example: 90 })
  @IsNumber()
  @IsOptional()
  targetValue?: number;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  notes?: string;
}
