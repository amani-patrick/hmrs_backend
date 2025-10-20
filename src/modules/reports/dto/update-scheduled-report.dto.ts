import { PartialType } from '@nestjs/swagger';
import { CreateScheduledReportDto } from './create-scheduled-report.dto';
import { IsEnum, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { ScheduleStatus } from '../entities/scheduled-report.entity';

export class UpdateScheduledReportDto extends PartialType(CreateScheduledReportDto) {
  @ApiPropertyOptional({ enum: ScheduleStatus })
  @IsEnum(ScheduleStatus)
  @IsOptional()
  status?: ScheduleStatus;
}
