import { IsString, IsNotEmpty, IsOptional, IsInt, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCertificationDto {
  @ApiProperty({ example: 'Safety Training' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'Compliance' })
  @IsString()
  @IsNotEmpty()
  category: string;

  @ApiProperty({ example: '1 year' })
  @IsString()
  @IsNotEmpty()
  validPeriod: string;

  @ApiProperty({ example: 'Workplace safety and hazard prevention training', required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ example: 45, required: false })
  @IsInt()
  @Min(0)
  @IsOptional()
  totalEmployees?: number;

  @ApiProperty({ example: 0, required: false })
  @IsInt()
  @Min(0)
  @IsOptional()
  certified?: number;

  @ApiProperty({ example: 0, required: false })
  @IsInt()
  @Min(0)
  @IsOptional()
  expiring?: number;

  @ApiProperty({ example: 0, required: false })
  @IsInt()
  @Min(0)
  @IsOptional()
  expired?: number;
}
