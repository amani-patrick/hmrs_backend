import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';

export class UpdateOvertimeRequestDto {
  @ApiProperty({ 
    description: 'Status of the overtime request', 
    enum: ['Pending', 'Approved', 'Rejected'],
    required: false
  })
  @IsString()
  @IsOptional()
  status?: string;

  @ApiProperty({ description: 'Notes for the request', required: false })
  @IsString()
  @IsOptional()
  notes?: string;
}