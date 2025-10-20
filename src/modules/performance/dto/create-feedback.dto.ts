import { IsString, IsNotEmpty, IsEnum, IsOptional, IsArray, IsBoolean } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { FeedbackType } from '../entities/feedback.entity';

export class CreateFeedbackDto {
  @ApiProperty({ example: 'recipient-uuid' })
  @IsString()
  @IsNotEmpty()
  recipientId: string;

  @ApiProperty({ example: 'giver-uuid' })
  @IsString()
  @IsNotEmpty()
  giverId: string;

  @ApiProperty({ enum: FeedbackType, example: FeedbackType.POSITIVE })
  @IsEnum(FeedbackType)
  type: FeedbackType;

  @ApiProperty({ example: 'Great work on the project presentation!' })
  @IsString()
  @IsNotEmpty()
  content: string;

  @ApiPropertyOptional()
  @IsArray()
  @IsOptional()
  ratings?: Array<{
    category: string;
    rating: number;
  }>;

  @ApiPropertyOptional({ example: ['teamwork', 'communication'] })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tags?: string[];

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  projectId?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  reviewId?: string;

  @ApiPropertyOptional({ default: false })
  @IsBoolean()
  @IsOptional()
  isAnonymous?: boolean;

  @ApiPropertyOptional({ default: false })
  @IsBoolean()
  @IsOptional()
  isPrivate?: boolean;
}
