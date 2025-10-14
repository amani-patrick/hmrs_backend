import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PayrollService } from './payroll.service';
import { PayrollController } from './payroll.controller';
import { PayrollRecord } from './entities/payroll-record.entity';
import { BenefitsPlan } from './entities/benefits-plan.entity';
import { SalaryGrade } from './entities/salary-grade.entity';
import { TENANT_DATA_SOURCE } from '../../tenancy/tenancy.symbols';
import { UsersModule } from '../users/users.module';
import { DepartmentModule } from '../department/department.module';
import { IremboPayModule } from './irembo-pay/irembo-pay.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([PayrollRecord, BenefitsPlan, SalaryGrade]),
    forwardRef(() => UsersModule),
    forwardRef(() => DepartmentModule),
    IremboPayModule,
  ],
  controllers: [PayrollController],
  providers: [
    {
      provide: 'PAYROLL_RECORD_REPOSITORY',
      useFactory: (tenantDataSource: any) => {
        if (!tenantDataSource) {
          throw new Error('Accessing payroll records without a valid Tenant Context');
        }
        return tenantDataSource.getRepository(PayrollRecord);
      },
      inject: [TENANT_DATA_SOURCE],
    },
    {
      provide: 'BENEFITS_PLAN_REPOSITORY',
      useFactory: (tenantDataSource: any) => {
        if (!tenantDataSource) {
          throw new Error('Accessing benefits plans without a valid Tenant Context');
        }
        return tenantDataSource.getRepository(BenefitsPlan);
      },
      inject: [TENANT_DATA_SOURCE],
    },
    {
      provide: 'SALARY_GRADE_REPOSITORY',
      useFactory: (tenantDataSource: any) => {
        if (!tenantDataSource) {
          throw new Error('Accessing salary grades without a valid Tenant Context');
        }
        return tenantDataSource.getRepository(SalaryGrade);
      },
      inject: [TENANT_DATA_SOURCE],
    },
    PayrollService,
  ],
  exports: [PayrollService],
})
export class PayrollModule {}