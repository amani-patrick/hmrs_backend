import { IsString, IsNotEmpty, IsDateString, IsOptional, IsEnum, IsBoolean } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { OffboardingReason } from '../entities/offboarding-process.entity';

export class CreateOffboardingDto {
  @ApiProperty({ example: 'employee-uuid' })
  @IsString()
  @IsNotEmpty()
  employeeId: string;

  @ApiProperty({ example: '2024-12-31' })
  @IsDateString()
  lastWorkingDay: string;

  @ApiProperty({ enum: OffboardingReason, example: OffboardingReason.RESIGNATION })
  @IsEnum(OffboardingReason)
  reason: OffboardingReason;

  @ApiPropertyOptional({ example: 'hr-manager-uuid' })
  @IsString()
  @IsOptional()
  assignedHR?: string;

  @ApiPropertyOptional({ example: 'Additional context for departure' })
  @IsString()
  @IsOptional()
  finalNotes?: string;
}
