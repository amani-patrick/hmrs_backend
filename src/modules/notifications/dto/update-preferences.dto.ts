import { IsBoolean, IsOptional, IsArray, IsObject, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { NotificationCategory } from '../entities/notification.entity';

export class UpdatePreferencesDto {
  @ApiPropertyOptional({ description: 'Enable in-app notifications' })
  @IsBoolean()
  @IsOptional()
  inAppEnabled?: boolean;

  @ApiPropertyOptional({ description: 'Enable email notifications' })
  @IsBoolean()
  @IsOptional()
  emailEnabled?: boolean;

  @ApiPropertyOptional({ description: 'Enable SMS notifications' })
  @IsBoolean()
  @IsOptional()
  smsEnabled?: boolean;

  @ApiPropertyOptional({ description: 'Enable push notifications' })
  @IsBoolean()
  @IsOptional()
  pushEnabled?: boolean;

  @ApiPropertyOptional({ description: 'Enable notification sounds' })
  @IsBoolean()
  @IsOptional()
  soundEnabled?: boolean;

  @ApiPropertyOptional({ description: 'Muted categories', type: [String] })
  @IsArray()
  @IsOptional()
  mutedCategories?: NotificationCategory[];

  @ApiPropertyOptional({ description: 'Quiet hours configuration' })
  @IsObject()
  @IsOptional()
  quietHours?: {
    enabled: boolean;
    start: string;
    end: string;
    timezone: string;
  };

  @ApiPropertyOptional({ description: 'Enable weekend notifications' })
  @IsBoolean()
  @IsOptional()
  weekendNotifications?: boolean;

  @ApiPropertyOptional({ description: 'Email digest days', type: [String] })
  @IsArray()
  @IsOptional()
  emailDigestDays?: string[];

  @ApiPropertyOptional({ description: 'Email digest time (HH:mm)' })
  @IsString()
  @IsOptional()
  emailDigestTime?: string;

  @ApiPropertyOptional({ description: 'Category-specific preferences' })
  @IsObject()
  @IsOptional()
  categoryPreferences?: any;
}
