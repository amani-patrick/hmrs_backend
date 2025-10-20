import { DataSource } from 'typeorm';
import { PerformanceReview } from './entities/performance-review.entity';
import { Goal } from './entities/goal.entity';
import { Feedback } from './entities/feedback.entity';
import { KPI } from './entities/kpi.entity';
import { KPIRecord } from './entities/kpi-record.entity';

export const performanceProviders = [
  {
    provide: 'PERFORMANCE_REVIEW_REPOSITORY',
    useFactory: (dataSource: DataSource) => dataSource.getRepository(PerformanceReview),
    inject: ['DATA_SOURCE'],
  },
  {
    provide: 'GOAL_REPOSITORY',
    useFactory: (dataSource: DataSource) => dataSource.getRepository(Goal),
    inject: ['DATA_SOURCE'],
  },
  {
    provide: 'FEEDBACK_REPOSITORY',
    useFactory: (dataSource: DataSource) => dataSource.getRepository(Feedback),
    inject: ['DATA_SOURCE'],
  },
  {
    provide: 'KPI_REPOSITORY',
    useFactory: (dataSource: DataSource) => dataSource.getRepository(KPI),
    inject: ['DATA_SOURCE'],
  },
  {
    provide: 'KPI_RECORD_REPOSITORY',
    useFactory: (dataSource: DataSource) => dataSource.getRepository(KPIRecord),
    inject: ['DATA_SOURCE'],
  },
];
