import { Module } from '@nestjs/common';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';
import { UsersModule } from '../../users/users.module';
import { LeaveModule } from '../../leave/leave.module';
import { TimeModule } from '../../time/time.module';
import { RecruitmentModule } from '../../recruitment/recruitment.module';

@Module({
  imports: [UsersModule, LeaveModule, TimeModule, RecruitmentModule],
  controllers: [DashboardController],
  providers: [DashboardService],
  exports: [DashboardService],
})
export class DashboardModule {}
