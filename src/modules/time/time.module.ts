import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TimeController } from './time.controller';
import { TimeService } from './time.service';
import { TimeEntry } from './entities/time-entry.entity';
import { OvertimeRequest } from './entities/overtime-request.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([TimeEntry, OvertimeRequest]),
  ],
  controllers: [TimeController],
  providers: [TimeService],
  exports: [TimeService],
})
export class TimeModule {}
