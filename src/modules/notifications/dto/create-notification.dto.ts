import { IsString, IsEnum, IsOptional, IsArray, IsObject, IsDateString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { NotificationType, NotificationPriority, NotificationCategory, NotificationChannel } from '../entities/notification.entity';

export class CreateNotificationDto {
  @ApiProperty({ description: 'User ID to receive notification' })
  @IsString()
  userId: string;

  @ApiProperty({ description: 'Notification title' })
  @IsString()
  title: string;

  @ApiProperty({ description: 'Notification message' })
  @IsString()
  message: string;

  @ApiPropertyOptional({ enum: NotificationType, default: NotificationType.INFO })
  @IsEnum(NotificationType)
  @IsOptional()
  type?: NotificationType;

  @ApiPropertyOptional({ enum: NotificationPriority, default: NotificationPriority.MEDIUM })
  @IsEnum(NotificationPriority)
  @IsOptional()
  priority?: NotificationPriority;

  @ApiPropertyOptional({ enum: NotificationCategory, default: NotificationCategory.OTHER })
  @IsEnum(NotificationCategory)
  @IsOptional()
  category?: NotificationCategory;

  @ApiPropertyOptional({ description: 'Delivery channels', type: [String], enum: NotificationChannel })
  @IsArray()
  @IsOptional()
  channels?: NotificationChannel[];

  @ApiPropertyOptional({ description: 'Action URL object' })
  @IsObject()
  @IsOptional()
  actionUrl?: {
    path: string;
    label?: string;
  };

  @ApiPropertyOptional({ description: 'Additional metadata' })
  @IsObject()
  @IsOptional()
  metadata?: any;

  @ApiPropertyOptional({ description: 'Expiration date' })
  @IsDateString()
  @IsOptional()
  expiresAt?: Date;
}
