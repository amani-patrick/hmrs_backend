import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../database/database.module';
import { LeaveService } from './leave.service';
import { LeaveController } from './leave.controller';
import { leaveProviders } from './leave.providers';

@Module({
  imports: [DatabaseModule],
  providers: [LeaveService, ...leaveProviders],
  controllers: [LeaveController],
  exports: [LeaveService],
})
export class LeaveModule {}
