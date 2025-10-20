import { ApiProperty } from '@nestjs/swagger';

export class TimeTrackingSummaryDto {
  @ApiProperty({ description: 'Project ID', type: String })
  projectId: string;

  @ApiProperty({ description: 'Total hours worked on the project', type: Number, format: 'float' })
  totalHours: number;

  @ApiProperty({ description: 'Number of time entries', type: Number })
  entryCount: number;
}
