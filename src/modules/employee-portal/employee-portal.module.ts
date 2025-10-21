import { Module } from '@nestjs/common';
import { EmployeePortalController } from './employee-portal.controller';
import { EmployeePortalService } from './employee-portal.service';
import { employeePortalProviders } from './employee-portal.providers';
import { DatabaseModule } from '../database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [EmployeePortalController],
  providers: [...employeePortalProviders, EmployeePortalService],
  exports: [EmployeePortalService],
})
export class EmployeePortalModule {}
