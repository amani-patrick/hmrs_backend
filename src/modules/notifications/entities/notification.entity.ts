import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

export enum NotificationType {
  INFO = 'info',
  SUCCESS = 'success',
  WARNING = 'warning',
  ERROR = 'error',
  REMINDER = 'reminder',
}

export enum NotificationPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent',
}

export enum NotificationChannel {
  IN_APP = 'in_app',
  EMAIL = 'email',
  SMS = 'sms',
  PUSH = 'push',
}

export enum NotificationCategory {
  LEAVE = 'leave',
  ATTENDANCE = 'attendance',
  PAYROLL = 'payroll',
  PERFORMANCE = 'performance',
  TRAINING = 'training',
  RECRUITMENT = 'recruitment',
  ONBOARDING = 'onboarding',
  OFFBOARDING = 'offboarding',
  ANNOUNCEMENT = 'announcement',
  SYSTEM = 'system',
  OTHER = 'other',
}

@Entity({ name: 'notifications' })
@Index(['tenantId', 'userId', 'isRead'])
@Index(['tenantId', 'createdAt'])
export class Notification {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  tenantId: string;

  @Column()
  userId: string;

  @Column()
  title: string;

  @Column({ type: 'text' })
  message: string;

  @Column({ type: 'enum', enum: NotificationType, default: NotificationType.INFO })
  type: NotificationType;

  @Column({ type: 'enum', enum: NotificationPriority, default: NotificationPriority.MEDIUM })
  priority: NotificationPriority;

  @Column({ type: 'enum', enum: NotificationCategory, default: NotificationCategory.OTHER })
  category: NotificationCategory;

  @Column({ default: false })
  isRead: boolean;

  @Column({ type: 'timestamp', nullable: true })
  readAt: Date | null;

  @Column({ type: 'simple-array', nullable: true })
  channels: NotificationChannel[];

  @Column({ type: 'jsonb', nullable: true })
  actionUrl: {
    path: string;
    label?: string;
  } | null;

  @Column({ type: 'jsonb', nullable: true })
  metadata: {
    moduleId?: string;
    entityType?: string;
    entityId?: string;
    actionBy?: string;
    [key: string]: any;
  };

  @Column({ nullable: true })
  sentBy: string | null;

  @Column({ default: false })
  emailSent: boolean;

  @Column({ type: 'timestamp', nullable: true })
  emailSentAt: Date | null;

  @Column({ default: false })
  smsSent: boolean;

  @Column({ type: 'timestamp', nullable: true })
  smsSentAt: Date | null;

  @Column({ default: false })
  pushSent: boolean;

  @Column({ type: 'timestamp', nullable: true })
  pushSentAt: Date | null;

  @Column({ type: 'timestamp', nullable: true })
  expiresAt: Date | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
