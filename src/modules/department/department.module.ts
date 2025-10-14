import { Module } from '@nestjs/common';
import { TENANT_DATA_SOURCE } from '../../tenancy/tenancy.symbols';
import { DepartmentService } from './department.service';
import { DepartmentController } from './department.controller';

@Module({
  controllers: [DepartmentController],
  providers: [
    {
      provide: 'DEPARTMENT_REPOSITORY',
      useFactory: (tenantDataSource: DataSource)=>{
        if(!tenantDataSource) return null;
        return tenantDataSource.getRepository(Department);
      },
      inject: [TENANT_DATA_SOURCE],
    },
    DepartmentService,
  ],
  exports: [DepartmentService]
})

export class DepartmentModule {}
