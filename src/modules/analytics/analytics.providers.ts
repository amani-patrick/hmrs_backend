import { DataSource } from 'typeorm';
import { DashboardWidget } from './entities/dashboard-widget.entity';

export const analyticsProviders = [
  {
    provide: 'DASHBOARD_WIDGET_REPOSITORY',
    useFactory: (dataSource: DataSource) => dataSource.getRepository(DashboardWidget),
    inject: ['DATA_SOURCE'],
  },
  {
    provide: 'USER_REPOSITORY',
    useFactory: (dataSource: DataSource) => dataSource.getRepository('User'),
    inject: ['DATA_SOURCE'],
  },
  {
    provide: 'LEAVE_REPOSITORY',
    useFactory: (dataSource: DataSource) => dataSource.getRepository('Leave'),
    inject: ['DATA_SOURCE'],
  },
  {
    provide: 'ATTENDANCE_REPOSITORY',
    useFactory: (dataSource: DataSource) => dataSource.getRepository('Attendance'),
    inject: ['DATA_SOURCE'],
  },
  {
    provide: 'ONBOARDING_REPOSITORY',
    useFactory: (dataSource: DataSource) => dataSource.getRepository('OnboardingProcess'),
    inject: ['DATA_SOURCE'],
  },
  {
    provide: 'OFFBOARDING_REPOSITORY',
    useFactory: (dataSource: DataSource) => dataSource.getRepository('OffboardingProcess'),
    inject: ['DATA_SOURCE'],
  },
];
