import { DataSource } from 'typeorm';
import { ReportTemplate } from './entities/report-template.entity';
import { GeneratedReport } from './entities/generated-report.entity';
import { ScheduledReport } from './entities/scheduled-report.entity';

export const reportsProviders = [
  {
    provide: 'REPORT_TEMPLATE_REPOSITORY',
    useFactory: (dataSource: DataSource) => dataSource.getRepository(ReportTemplate),
    inject: ['DATA_SOURCE'],
  },
  {
    provide: 'GENERATED_REPORT_REPOSITORY',
    useFactory: (dataSource: DataSource) => dataSource.getRepository(GeneratedReport),
    inject: ['DATA_SOURCE'],
  },
  {
    provide: 'SCHEDULED_REPORT_REPOSITORY',
    useFactory: (dataSource: DataSource) => dataSource.getRepository(ScheduledReport),
    inject: ['DATA_SOURCE'],
  },
];
