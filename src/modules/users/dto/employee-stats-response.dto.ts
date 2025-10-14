import { ApiProperty } from '@nestjs/swagger';

export class EmployeeStatsResponseDto {
  @ApiProperty({
    description: 'Total number of active employees in the system',
    example: 150
  })
  totalEmployees: number;

  @ApiProperty({
    description: 'Number of employees who joined in the current month',
    example: 5
  })
  newThisMonth: number;

  @ApiProperty({
    description: 'Average salary across all employees',
    type: String,
    example: '75000.00'
  })
  averageSalary: string;

  @ApiProperty({
    description: 'Number of active employees (same as totalEmployees for consistency)',
    example: 150
  })
  activeEmployees: number;

  @ApiProperty({
    description: 'Timestamp when the statistics were generated',
    type: String,
    example: '2023-10-14T16:21:14.000Z'
  })
  timestamp: string;

  constructor(partial: Partial<Omit<EmployeeStatsResponseDto, 'timestamp'>>) {
    Object.assign(this, partial);
    this.timestamp = new Date().toISOString();
  }
}
