import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  Request,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { NotificationsService } from './notifications.service';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { BulkNotificationDto } from './dto/bulk-notification.dto';
import { UpdatePreferencesDto } from './dto/update-preferences.dto';

@ApiTags('Notifications')
@ApiBearerAuth()
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  // ==================== NOTIFICATION ENDPOINTS ====================

  @Post()
  @ApiOperation({ summary: 'Create single notification' })
  @ApiResponse({ status: 201, description: 'Notification created' })
  async createNotification(@Request() req, @Body() dto: CreateNotificationDto) {
    return this.notificationsService.createNotification(
      req.user.tenantId,
      dto,
      req.user.userId,
    );
  }

  @Post('bulk')
  @ApiOperation({ summary: 'Create bulk notifications for multiple users' })
  @ApiResponse({ status: 201, description: 'Bulk notifications created' })
  async createBulkNotification(@Request() req, @Body() dto: BulkNotificationDto) {
    return this.notificationsService.createBulkNotification(
      req.user.tenantId,
      dto,
      req.user.userId,
    );
  }

  @Get('me')
  @ApiOperation({ summary: 'Get my notifications' })
  @ApiQuery({ name: 'isRead', required: false, type: Boolean })
  @ApiQuery({ name: 'category', required: false, type: String })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'offset', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'User notifications with pagination' })
  async getMyNotifications(
    @Request() req,
    @Query('isRead') isRead?: string,
    @Query('category') category?: string,
    @Query('limit', new ParseIntPipe({ optional: true })) limit?: number,
    @Query('offset', new ParseIntPipe({ optional: true })) offset?: number,
  ) {
    const filters: any = {};
    
    if (isRead !== undefined) {
      filters.isRead = isRead === 'true';
    }
    
    if (category) {
      filters.category = category;
    }
    
    if (limit) {
      filters.limit = limit;
    }
    
    if (offset) {
      filters.offset = offset;
    }

    return this.notificationsService.getUserNotifications(
      req.user.tenantId,
      req.user.userId,
      filters,
    );
  }

  @Get('me/unread-count')
  @ApiOperation({ summary: 'Get unread notification count' })
  @ApiResponse({ status: 200, description: 'Unread count' })
  async getUnreadCount(@Request() req) {
    const count = await this.notificationsService.getUnreadCount(
      req.user.tenantId,
      req.user.userId,
    );
    return { count };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get notification by ID' })
  @ApiResponse({ status: 200, description: 'Notification details' })
  @ApiResponse({ status: 404, description: 'Notification not found' })
  async getNotificationById(@Request() req, @Param('id') id: string) {
    return this.notificationsService.getNotificationById(req.user.tenantId, id);
  }

  @Patch(':id/read')
  @ApiOperation({ summary: 'Mark notification as read' })
  @ApiResponse({ status: 200, description: 'Notification marked as read' })
  async markAsRead(@Request() req, @Param('id') id: string) {
    return this.notificationsService.markAsRead(req.user.tenantId, req.user.userId, id);
  }

  @Patch(':id/unread')
  @ApiOperation({ summary: 'Mark notification as unread' })
  @ApiResponse({ status: 200, description: 'Notification marked as unread' })
  async markAsUnread(@Request() req, @Param('id') id: string) {
    return this.notificationsService.markAsUnread(req.user.tenantId, req.user.userId, id);
  }

  @Patch('read-all')
  @ApiOperation({ summary: 'Mark all notifications as read' })
  @ApiResponse({ status: 200, description: 'All notifications marked as read' })
  async markAllAsRead(@Request() req) {
    return this.notificationsService.markAllAsRead(req.user.tenantId, req.user.userId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete notification' })
  @ApiResponse({ status: 200, description: 'Notification deleted' })
  @ApiResponse({ status: 404, description: 'Notification not found' })
  async deleteNotification(@Request() req, @Param('id') id: string) {
    await this.notificationsService.deleteNotification(req.user.tenantId, req.user.userId, id);
    return { message: 'Notification deleted successfully' };
  }

  @Delete('read/all')
  @ApiOperation({ summary: 'Delete all read notifications' })
  @ApiResponse({ status: 200, description: 'Read notifications deleted' })
  async deleteAllRead(@Request() req) {
    return this.notificationsService.deleteAllRead(req.user.tenantId, req.user.userId);
  }

  // ==================== PREFERENCES ENDPOINTS ====================

  @Get('preferences/me')
  @ApiOperation({ summary: 'Get my notification preferences' })
  @ApiResponse({ status: 200, description: 'User notification preferences' })
  async getMyPreferences(@Request() req) {
    return this.notificationsService.getPreferences(req.user.tenantId, req.user.userId);
  }

  @Patch('preferences/me')
  @ApiOperation({ summary: 'Update my notification preferences' })
  @ApiResponse({ status: 200, description: 'Preferences updated' })
  async updateMyPreferences(@Request() req, @Body() dto: UpdatePreferencesDto) {
    return this.notificationsService.updatePreferences(
      req.user.tenantId,
      req.user.userId,
      dto,
    );
  }

  // ==================== ADMIN ENDPOINTS ====================

  @Post('cleanup/expired')
  @ApiOperation({ summary: 'Cleanup expired notifications (Admin)' })
  @ApiResponse({ status: 200, description: 'Expired notifications cleaned up' })
  async cleanupExpired(@Request() req) {
    return this.notificationsService.cleanupExpiredNotifications(req.user.tenantId);
  }

  @Post('cleanup/old')
  @ApiOperation({ summary: 'Cleanup old read notifications (Admin)' })
  @ApiQuery({ name: 'days', required: false, type: Number, description: 'Days to keep (default 90)' })
  @ApiResponse({ status: 200, description: 'Old notifications cleaned up' })
  async cleanupOld(
    @Request() req,
    @Query('days', new ParseIntPipe({ optional: true })) days?: number,
  ) {
    return this.notificationsService.cleanupOldNotifications(req.user.tenantId, days);
  }
}
