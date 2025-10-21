import { IsString, IsEnum, IsOptional, IsArray } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TicketCategory, TicketPriority } from '../entities/ticket.entity';

export class CreateTicketDto {
  @ApiProperty({ description: 'Ticket subject' })
  @IsString()
  subject: string;

  @ApiProperty({ description: 'Ticket description' })
  @IsString()
  description: string;

  @ApiProperty({ enum: TicketCategory, description: 'Ticket category' })
  @IsEnum(TicketCategory)
  category: TicketCategory;

  @ApiPropertyOptional({ enum: TicketPriority, default: TicketPriority.MEDIUM })
  @IsEnum(TicketPriority)
  @IsOptional()
  priority?: TicketPriority;

  @ApiPropertyOptional({ description: 'File attachment URLs', type: [String] })
  @IsArray()
  @IsOptional()
  attachments?: string[];

  @ApiPropertyOptional({ description: 'Tags', type: [String] })
  @IsArray()
  @IsOptional()
  tags?: string[];
}
