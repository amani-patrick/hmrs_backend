import { Module } from '@nestjs/common';
import { ManagerDashboardController } from './manager-dashboard.controller';
import { ManagerDashboardRealService } from './manager-dashboard.service';
import { UsersModule } from '../users/users.module';
import { LeaveModule } from '../leave/leave.module';
import { AttendanceModule } from '../attendance/attendance.module';
import { PerformanceModule } from '../performance/performance.module';
import { TrainingModule } from '../training/training.module';

@Module({
  imports: [
    UsersModule,
    LeaveModule,
    AttendanceModule,
    PerformanceModule,
    TrainingModule,
  ],
  controllers: [ManagerDashboardController],
  providers: [ManagerDashboardRealService],
  exports: [ManagerDashboardRealService],
})
export class ManagerDashboardModule {}
