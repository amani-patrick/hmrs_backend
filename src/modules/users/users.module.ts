import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { User } from './entities/user.entity';
import { UsersService } from './users.service';
import { UsersController, PublicUsersController } from './users.controller';
import { DepartmentModule } from '../department/department.module';
import { PayrollModule } from '../payroll/payroll.module';
import { TenantsModule } from '../../public-modules/tenants/tenants.module';
import { TENANT_DATA_SOURCE } from '../../tenancy/tenancy.symbols';

@Module({
  providers: [
    {
      provide: 'USER_REPOSITORY',
      useFactory: (tenantDataSource: DataSource) => {
        if (!tenantDataSource) {
          throw new Error('Accessing tenanted service without a valid Tenant Context');
        }
        return tenantDataSource.getRepository(User);
      },
      inject: [TENANT_DATA_SOURCE],
    },
    UsersService,
  ],
  controllers: [UsersController, PublicUsersController],
  imports: [
    TypeOrmModule.forFeature([User]),
    forwardRef(() => DepartmentModule),
    forwardRef(() => PayrollModule),
    TenantsModule,
  ],
  exports: [UsersService, 'USER_REPOSITORY'],
})
export class UsersModule {}