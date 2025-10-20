import { IsString, IsNotEmpty, IsDateString, IsNumber, IsOptional, IsArray } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class SubmitClaimDto {
  @ApiProperty({ example: 'enrollment-uuid' })
  @IsString()
  @IsNotEmpty()
  enrollmentId: string;

  @ApiProperty({ example: '2024-12-01' })
  @IsDateString()
  serviceDate: string;

  @ApiProperty({ example: 500.00 })
  @IsNumber()
  claimAmount: number;

  @ApiPropertyOptional({ example: 'Medical consultation' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional()
  @IsArray()
  @IsOptional()
  attachments?: string[];
}
