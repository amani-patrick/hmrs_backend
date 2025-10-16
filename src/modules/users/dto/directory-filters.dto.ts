import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsUUID } from 'class-validator';

export class DirectoryFiltersDto {
  @ApiPropertyOptional({
    description: 'Department ID to filter by',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  @IsOptional()
  departmentId?: string;

  @ApiPropertyOptional({
    description: 'Search query to filter employees by name, email, or position',
    example: 'john',
  })
  @IsString()
  @IsOptional()
  search?: string;

  @ApiPropertyOptional({
    description: 'Location to filter by',
    example: 'New York',
  })
  @IsString()
  @IsOptional()
  location?: string;
}
