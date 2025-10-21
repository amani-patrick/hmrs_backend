import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';
import { NotificationCategory, NotificationChannel } from './notification.entity';

@Entity({ name: 'notification_preferences' })
@Index(['tenantId', 'userId'], { unique: true })
export class NotificationPreferences {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  tenantId: string;

  @Column()
  userId: string;

  @Column({ type: 'jsonb', default: {} })
  categoryPreferences: {
    [key in NotificationCategory]?: {
      enabled: boolean;
      channels: NotificationChannel[];
    };
  };

  @Column({ default: true })
  inAppEnabled: boolean;

  @Column({ default: true })
  emailEnabled: boolean;

  @Column({ default: false })
  smsEnabled: boolean;

  @Column({ default: true })
  pushEnabled: boolean;

  @Column({ default: true })
  soundEnabled: boolean;

  @Column({ type: 'simple-array', nullable: true })
  mutedCategories: NotificationCategory[];

  @Column({ type: 'jsonb', nullable: true })
  quietHours: {
    enabled: boolean;
    start: string; // HH:mm format
    end: string; // HH:mm format
    timezone: string;
  };

  @Column({ default: true })
  weekendNotifications: boolean;

  @Column({ type: 'simple-array', nullable: true })
  emailDigestDays: string[]; // ['monday', 'friday']

  @Column({ nullable: true })
  emailDigestTime: string; // HH:mm format

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
