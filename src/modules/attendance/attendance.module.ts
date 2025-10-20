import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../database/database.module';
import { AttendanceService } from './attendance.service';
import { AttendanceController } from './attendance.controller';
import { attendanceProviders } from './attendance.providers';

@Module({
  imports: [DatabaseModule],
  providers: [AttendanceService, ...attendanceProviders],
  controllers: [AttendanceController],
  exports: [AttendanceService],
})
export class AttendanceModule {}
