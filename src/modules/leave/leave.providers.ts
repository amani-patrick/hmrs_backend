import { DataSource } from 'typeorm';
import { LeaveRequest } from './entities/leave-request.entity';
import { LeaveType } from './entities/leave-type.entity';
import { LeaveBalance } from './entities/leave-balance.entity';

export const leaveProviders = [
  {
    provide: 'LEAVE_REQUEST_REPOSITORY',
    useFactory: (dataSource: DataSource) => dataSource.getRepository(LeaveRequest),
    inject: ['DATA_SOURCE'],
  },
  {
    provide: 'LEAVE_TYPE_REPOSITORY',
    useFactory: (dataSource: DataSource) => dataSource.getRepository(LeaveType),
    inject: ['DATA_SOURCE'],
  },
  {
    provide: 'LEAVE_BALANCE_REPOSITORY',
    useFactory: (dataSource: DataSource) => dataSource.getRepository(LeaveBalance),
    inject: ['DATA_SOURCE'],
  },
];
