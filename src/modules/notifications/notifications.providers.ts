import { DataSource } from 'typeorm';
import { Notification } from './entities/notification.entity';
import { NotificationPreferences } from './entities/notification-preferences.entity';

export const notificationsProviders = [
  {
    provide: 'NOTIFICATION_REPOSITORY',
    useFactory: (dataSource: DataSource) => dataSource.getRepository(Notification),
    inject: ['DATA_SOURCE'],
  },
  {
    provide: 'NOTIFICATION_PREFERENCES_REPOSITORY',
    useFactory: (dataSource: DataSource) => dataSource.getRepository(NotificationPreferences),
    inject: ['DATA_SOURCE'],
  },
];
