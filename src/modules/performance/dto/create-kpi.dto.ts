import { IsString, IsNotEmpty, IsEnum, IsOptional, IsNumber, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { KpiType, KpiFrequency } from '../entities/kpi.entity';

export class CreateKpiDto {
  @ApiProperty({ example: 'Customer Satisfaction Score' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({ example: 'Measure overall customer satisfaction' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ enum: KpiType, example: KpiType.QUANTITATIVE })
  @IsEnum(KpiType)
  type: KpiType;

  @ApiPropertyOptional({ example: 'Sales' })
  @IsString()
  @IsOptional()
  category?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  departmentId?: string;

  @ApiPropertyOptional({ example: '%' })
  @IsString()
  @IsOptional()
  unit?: string;

  @ApiPropertyOptional({ example: 90 })
  @IsNumber()
  @IsOptional()
  target?: number;

  @ApiPropertyOptional({ example: 75 })
  @IsNumber()
  @IsOptional()
  threshold?: number;

  @ApiProperty({ enum: KpiFrequency, example: KpiFrequency.MONTHLY })
  @IsEnum(KpiFrequency)
  frequency: KpiFrequency;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  formula?: string;

  @ApiPropertyOptional({ example: 5 })
  @IsNumber()
  @Min(0)
  @IsOptional()
  weight?: number;
}
