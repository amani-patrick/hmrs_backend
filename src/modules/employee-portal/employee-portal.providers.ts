import { DataSource } from 'typeorm';
import { EmployeeProfile } from './entities/employee-profile.entity';
import { EmployeeDocument } from './entities/employee-document.entity';

export const employeePortalProviders = [
  {
    provide: 'EMPLOYEE_PROFILE_REPOSITORY',
    useFactory: (dataSource: DataSource) => dataSource.getRepository(EmployeeProfile),
    inject: ['DATA_SOURCE'],
  },
  {
    provide: 'EMPLOYEE_DOCUMENT_REPOSITORY',
    useFactory: (dataSource: DataSource) => dataSource.getRepository(EmployeeDocument),
    inject: ['DATA_SOURCE'],
  },
];
