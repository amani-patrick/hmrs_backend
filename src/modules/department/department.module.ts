import { Module, forwardRef } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { TENANT_DATA_SOURCE } from '../../tenancy/tenancy.symbols';
import {  DepartmentRealService } from './department.service';
import { DepartmentController } from './department.controller';
import { Department } from './entities/department.entity';
import { UsersModule } from '../users/users.module';
import { Position } from '../position/entities/position.entity';

@Module({
  imports: [forwardRef(() => UsersModule)],
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
    {
      provide: 'POSITION_REPOSITORY',
      useFactory: (tenantDataSource: DataSource) => {
        if (!tenantDataSource) return null;
        return tenantDataSource.getRepository(Position);
      },
      inject: [TENANT_DATA_SOURCE],
    },
    DepartmentRealService,
  ],
  exports: [DepartmentRealService]
})

export class DepartmentModule {}
