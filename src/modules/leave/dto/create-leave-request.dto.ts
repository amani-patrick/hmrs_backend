import { IsString, IsNotEmpty, IsDateString, IsOptional, IsBoolean, IsEnum, IsNumber, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateLeaveRequestDto {
  @ApiProperty({ example: 'leave-type-uuid' })
  @IsString()
  @IsNotEmpty()
  leaveTypeId: string;

  @ApiProperty({ example: '2024-12-20' })
  @IsDateString()
  @IsNotEmpty()
  startDate: string;

  @ApiProperty({ example: '2024-12-22' })
  @IsDateString()
  @IsNotEmpty()
  endDate: string;

  @ApiPropertyOptional({ example: 'Family vacation' })
  @IsString()
  @IsOptional()
  reason?: string;

  @ApiPropertyOptional({ default: false })
  @IsBoolean()
  @IsOptional()
  halfDay?: boolean;

  @ApiPropertyOptional({ enum: ['morning', 'afternoon'], example: 'morning' })
  @IsEnum(['morning', 'afternoon'])
  @IsOptional()
  halfDayPeriod?: 'morning' | 'afternoon';
}
