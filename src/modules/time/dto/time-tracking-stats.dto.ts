import { ApiProperty } from '@nestjs/swagger';
import { TimeEntry } from '../entities/time-entry.entity';

export class TimeTrackingStatsDto {
  @ApiProperty({ description: 'Total number of time entries' })
  totalEntries: number;

  @ApiProperty({ description: 'Total hours worked', type: Number, format: 'float' })
  totalHours: number;

  @ApiProperty({ description: 'Last time entry', type: TimeEntry, nullable: true })
  lastEntry: TimeEntry | null;

  @ApiProperty({ 
    description: 'Current status', 
    enum: ['Clocked In', 'Clocked Out'],
    default: 'Clocked Out'
  })
  currentStatus: string;
}
