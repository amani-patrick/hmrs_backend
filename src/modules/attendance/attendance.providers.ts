import { DataSource } from 'typeorm';
import { AttendanceRecord } from './entities/attendance-record.entity';
import { AttendanceSummary } from './entities/attendance-summary.entity';

export const attendanceProviders = [
  {
    provide: 'ATTENDANCE_RECORD_REPOSITORY',
    useFactory: (dataSource: DataSource) => dataSource.getRepository(AttendanceRecord),
    inject: ['DATA_SOURCE'],
  },
  {
    provide: 'ATTENDANCE_SUMMARY_REPOSITORY',
    useFactory: (dataSource: DataSource) => dataSource.getRepository(AttendanceSummary),
    inject: ['DATA_SOURCE'],
  },
];
