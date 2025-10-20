import { IsEnum, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { LeaveStatus } from '../entities/leave-request.entity';

export class ApproveLeaveRequestDto {
  @ApiProperty({ enum: LeaveStatus, example: LeaveStatus.APPROVED })
  @IsEnum(LeaveStatus)
  status: LeaveStatus;

  @ApiPropertyOptional({ example: 'Approved for the requested dates' })
  @IsString()
  @IsOptional()
  approverNotes?: string;
}
