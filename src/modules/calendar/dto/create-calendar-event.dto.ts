import { IsDateString, IsNotEmpty, IsOptional, IsString, IsArray, IsInt, Min, Max } from 'class-validator';

export class CreateCalendarEventDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsDateString()
  startTime: Date;

  @IsDateString()
  endTime: Date;

  @IsString()
  @IsOptional()
  type?: string;

  @IsString()
  @IsOptional()
  location?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  relatedEntityId?: string;

  @IsArray()
  @IsOptional()
  attendees?: Array<{
    id: string;
    name: string;
    email: string;
    status?: 'accepted' | 'declined' | 'tentative' | 'needsAction';
  }>;

  @IsString()
  @IsOptional()
  timeZone?: string;

  @IsString()
  @IsOptional()
  recurrence?: string;

  @IsString()
  @IsOptional()
  colorId?: string;
}
