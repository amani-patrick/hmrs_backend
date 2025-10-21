import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { Repository, In, LessThan, MoreThan } from 'typeorm';
import { Notification, NotificationChannel } from './entities/notification.entity';
import { NotificationPreferences } from './entities/notification-preferences.entity';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { BulkNotificationDto } from './dto/bulk-notification.dto';
import { UpdatePreferencesDto } from './dto/update-preferences.dto';
import { EmailService } from './services/email.service';
import { SmsService } from './services/sms.service';
import { PushService } from './services/push.service';

@Injectable()
export class NotificationsService {
  constructor(
    @Inject('NOTIFICATION_REPOSITORY')
    private readonly notificationRepository: Repository<Notification>,
    @Inject('NOTIFICATION_PREFERENCES_REPOSITORY')
    private readonly preferencesRepository: Repository<NotificationPreferences>,
    private readonly emailService: EmailService,
    private readonly smsService: SmsService,
    private readonly pushService: PushService,
  ) {}

  // ==================== NOTIFICATION OPERATIONS ====================

  async createNotification(
    tenantId: string,
    dto: CreateNotificationDto,
    sentBy?: string,
  ): Promise<Notification> {
    const notification = this.notificationRepository.create({
      ...dto,
      tenantId,
      sentBy,
      channels: dto.channels || [NotificationChannel.IN_APP],
    });

    const saved = await this.notificationRepository.save(notification);

    // Process channels asynchronously (in real app, use queue)
    this.processNotificationChannels(saved).catch(err => 
      console.error('Failed to process notification channels:', err)
    );

    return saved;
  }

  async createBulkNotification(
    tenantId: string,
    dto: BulkNotificationDto,
    sentBy?: string,
  ): Promise<Notification[]> {
    const notifications = dto.userIds.map(userId =>
      this.notificationRepository.create({
        tenantId,
        userId,
        title: dto.title,
        message: dto.message,
        type: dto.type,
        priority: dto.priority,
        category: dto.category,
        channels: dto.channels || [NotificationChannel.IN_APP],
        actionUrl: dto.actionUrl,
        metadata: dto.metadata,
        expiresAt: dto.expiresAt,
        sentBy,
      }),
    );

    const saved = await this.notificationRepository.save(notifications);

    // Process channels for all notifications
    saved.forEach(notif => {
      this.processNotificationChannels(notif).catch(err =>
        console.error(`Failed to process channels for notification ${notif.id}:`, err)
      );
    });

    return saved;
  }

  async getUserNotifications(
    tenantId: string,
    userId: string,
    filters?: {
      isRead?: boolean;
      category?: string;
      limit?: number;
      offset?: number;
    },
  ): Promise<{ notifications: Notification[]; total: number; unread: number }> {
    const where: any = { tenantId, userId };
    
    if (filters?.isRead !== undefined) {
      where.isRead = filters.isRead;
    }
    
    if (filters?.category) {
      where.category = filters.category;
    }

    // Remove expired notifications
    const now = new Date();
    where.expiresAt = [null, MoreThan(now)];

    const [notifications, total] = await this.notificationRepository.findAndCount({
      where,
      order: { createdAt: 'DESC' },
      take: filters?.limit || 50,
      skip: filters?.offset || 0,
    });

    const unread = await this.notificationRepository.count({
      where: { tenantId, userId, isRead: false },
    });

    return { notifications, total, unread };
  }

  async getNotificationById(tenantId: string, id: string): Promise<Notification> {
    const notification = await this.notificationRepository.findOne({
      where: { id, tenantId },
    });

    if (!notification) {
      throw new NotFoundException(`Notification with ID ${id} not found`);
    }

    return notification;
  }

  async markAsRead(tenantId: string, userId: string, id: string): Promise<Notification> {
    const notification = await this.notificationRepository.findOne({
      where: { id, tenantId, userId },
    });

    if (!notification) {
      throw new NotFoundException('Notification not found');
    }

    notification.isRead = true;
    notification.readAt = new Date();

    return this.notificationRepository.save(notification);
  }

  async markAllAsRead(tenantId: string, userId: string): Promise<{ affected: number }> {
    const result = await this.notificationRepository.update(
      { tenantId, userId, isRead: false },
      { isRead: true, readAt: new Date() },
    );

    return { affected: result.affected || 0 };
  }

  async markAsUnread(tenantId: string, userId: string, id: string): Promise<Notification> {
    const notification = await this.notificationRepository.findOne({
      where: { id, tenantId, userId },
    });

    if (!notification) {
      throw new NotFoundException('Notification not found');
    }

    notification.isRead = false;
    notification.readAt = null;

    return this.notificationRepository.save(notification);
  }

  async deleteNotification(tenantId: string, userId: string, id: string): Promise<void> {
    const result = await this.notificationRepository.delete({
      id,
      tenantId,
      userId,
    });

    if (result.affected === 0) {
      throw new NotFoundException('Notification not found');
    }
  }

  async deleteAllRead(tenantId: string, userId: string): Promise<{ affected: number }> {
    const result = await this.notificationRepository.delete({
      tenantId,
      userId,
      isRead: true,
    });

    return { affected: result.affected || 0 };
  }

  async getUnreadCount(tenantId: string, userId: string): Promise<number> {
    return this.notificationRepository.count({
      where: { tenantId, userId, isRead: false },
    });
  }

  // ==================== PREFERENCES ====================

  async getPreferences(tenantId: string, userId: string): Promise<NotificationPreferences> {
    let preferences = await this.preferencesRepository.findOne({
      where: { tenantId, userId },
    });

    if (!preferences) {
      // Create default preferences
      preferences = await this.createDefaultPreferences(tenantId, userId);
    }

    return preferences;
  }

  async updatePreferences(
    tenantId: string,
    userId: string,
    dto: UpdatePreferencesDto,
  ): Promise<NotificationPreferences> {
    let preferences = await this.preferencesRepository.findOne({
      where: { tenantId, userId },
    });

    if (!preferences) {
      preferences = await this.createDefaultPreferences(tenantId, userId);
    }

    Object.assign(preferences, dto);

    return this.preferencesRepository.save(preferences);
  }

  private async createDefaultPreferences(
    tenantId: string,
    userId: string,
  ): Promise<NotificationPreferences> {
    const preferences = this.preferencesRepository.create({
      tenantId,
      userId,
      inAppEnabled: true,
      emailEnabled: true,
      smsEnabled: false,
      pushEnabled: true,
      soundEnabled: true,
      weekendNotifications: true,
      categoryPreferences: {},
      mutedCategories: [],
    });

    return this.preferencesRepository.save(preferences);
  }

  // ==================== CHANNEL PROCESSING ====================

  private async processNotificationChannels(notification: Notification): Promise<void> {
    // Get user preferences
    const preferences = await this.getPreferences(notification.tenantId, notification.userId);

    // Check quiet hours
    if (this.isInQuietHours(preferences)) {
      return; // Skip sending during quiet hours
    }

    // Process each channel
    for (const channel of notification.channels) {
      switch (channel) {
        case NotificationChannel.EMAIL:
          if (preferences.emailEnabled) {
            await this.sendEmail(notification);
          }
          break;
        case NotificationChannel.SMS:
          if (preferences.smsEnabled) {
            await this.sendSMS(notification);
          }
          break;
        case NotificationChannel.PUSH:
          if (preferences.pushEnabled) {
            await this.sendPush(notification);
          }
          break;
        case NotificationChannel.IN_APP:
          // Already saved in database
          break;
      }
    }
  }

  private isInQuietHours(preferences: NotificationPreferences): boolean {
    if (!preferences.quietHours?.enabled) {
      return false;
    }

    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();

    const [startHour, startMinute] = preferences.quietHours.start.split(':').map(Number);
    const [endHour, endMinute] = preferences.quietHours.end.split(':').map(Number);

    const currentTime = currentHour * 60 + currentMinute;
    const startTime = startHour * 60 + startMinute;
    const endTime = endHour * 60 + endMinute;

    if (startTime < endTime) {
      return currentTime >= startTime && currentTime <= endTime;
    } else {
      // Quiet hours span midnight
      return currentTime >= startTime || currentTime <= endTime;
    }
  }

  private async sendEmail(notification: Notification): Promise<void> {
    try {
      const sent = await this.emailService.sendEmail(notification);
      notification.emailSent = sent;
      notification.emailSentAt = sent ? new Date() : null;
      await this.notificationRepository.save(notification);
    } catch (error) {
      console.error('Email sending failed:', error);
    }
  }

  private async sendSMS(notification: Notification): Promise<void> {
    try {
      // Would need to get user's phone number from user service
      const phoneNumber = '+1234567890'; // Placeholder
      const sent = await this.smsService.sendSMS(notification, phoneNumber);
      notification.smsSent = sent;
      notification.smsSentAt = sent ? new Date() : null;
      await this.notificationRepository.save(notification);
    } catch (error) {
      console.error('SMS sending failed:', error);
    }
  }

  private async sendPush(notification: Notification): Promise<void> {
    try {
      // Would need to get user's device tokens from device service
      const deviceTokens = []; // Placeholder
      const sent = await this.pushService.sendPush(notification, deviceTokens);
      notification.pushSent = sent;
      notification.pushSentAt = sent ? new Date() : null;
      await this.notificationRepository.save(notification);
    } catch (error) {
      console.error('Push notification sending failed:', error);
    }
  }

  // ==================== CLEANUP ====================

  async cleanupExpiredNotifications(tenantId: string): Promise<{ deleted: number }> {
    const now = new Date();
    const result = await this.notificationRepository.delete({
      tenantId,
      expiresAt: LessThan(now),
    });

    return { deleted: result.affected || 0 };
  }

  async cleanupOldNotifications(tenantId: string, days: number = 90): Promise<{ deleted: number }> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    const result = await this.notificationRepository.delete({
      tenantId,
      isRead: true,
      createdAt: LessThan(cutoffDate),
    });

    return { deleted: result.affected || 0 };
  }
}
