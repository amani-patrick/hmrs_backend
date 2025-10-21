import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module';
import { PerformanceController } from './performance.controller';
import { PerformanceService } from './performance.service';
import { performanceProviders } from './performance.providers';

@Module({
  imports: [DatabaseModule],
  controllers: [PerformanceController],
  providers: [PerformanceService, ...performanceProviders],
  exports: [PerformanceService],
})
export class PerformanceModule {}
