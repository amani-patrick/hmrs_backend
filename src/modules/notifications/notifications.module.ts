import { Module } from '@nestjs/common';
import { NotificationsController } from './notifications.controller';
import { NotificationsService } from './notifications.service';
import { notificationsProviders } from './notifications.providers';
import { DatabaseModule } from '../database/database.module';
import { EmailService } from './services/email.service';
import { SmsService } from './services/sms.service';
import { PushService } from './services/push.service';

@Module({
  imports: [DatabaseModule],
  controllers: [NotificationsController],
  providers: [
    ...notificationsProviders,
    NotificationsService,
    EmailService,
    SmsService,
    PushService,
  ],
  exports: [NotificationsService],
})
export class NotificationsModule {}
