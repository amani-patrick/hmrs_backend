import { IsString, IsNotEmpty, IsInt, IsBoolean, IsOptional, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateLeaveTypeDto {
  @ApiProperty({ example: 'Annual Leave' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({ example: 'Yearly vacation leave' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ example: 25 })
  @IsInt()
  @Min(0)
  defaultDays: number;

  @ApiPropertyOptional({ default: true })
  @IsBoolean()
  @IsOptional()
  requiresApproval?: boolean;

  @ApiPropertyOptional({ default: true })
  @IsBoolean()
  @IsOptional()
  isPaid?: boolean;

  @ApiPropertyOptional({ default: 0 })
  @IsInt()
  @Min(0)
  @IsOptional()
  maxConsecutiveDays?: number;

  @ApiPropertyOptional({ default: 0 })
  @IsInt()
  @Min(0)
  @IsOptional()
  minDaysNotice?: number;

  @ApiPropertyOptional({ default: false })
  @IsBoolean()
  @IsOptional()
  allowNegativeBalance?: boolean;

  @ApiPropertyOptional({ default: true })
  @IsBoolean()
  @IsOptional()
  allowHalfDay?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  carryOverRules?: {
    enabled: boolean;
    maxDays?: number;
    expiryMonths?: number;
  };
}
