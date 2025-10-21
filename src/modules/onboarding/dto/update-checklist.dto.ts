import { IsString, IsNotEmpty, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateChecklistItemDto {
  @ApiProperty({ example: 'checklist-item-uuid' })
  @IsString()
  @IsNotEmpty()
  itemId: string;

  @ApiProperty({ example: true })
  @IsBoolean()
  completed: boolean;
}
