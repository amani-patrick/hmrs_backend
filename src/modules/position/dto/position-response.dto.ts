import { ApiProperty } from '@nestjs/swagger';

export class PositionResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  title: string;

  @ApiProperty({ required: false })
  description?: string;

  @ApiProperty({ required: false })
  minSalary?: number;

  @ApiProperty({ required: false })
  maxSalary?: number;

  @ApiProperty()
  departmentId: string;

  @ApiProperty({ type: Object, required: false })
  keyRequirements?: Record<string, any>;

  @ApiProperty({ type: [String], required: false })
  responsibilities?: string[];

  @ApiProperty({ type: Object, required: false })
  details?: { tags: string[] };

  @ApiProperty()
  isActive: boolean;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
