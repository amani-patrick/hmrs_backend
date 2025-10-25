import { Module } from '@nestjs/common';
import { AnalyticsController } from './analytics.controller';
import { AnalyticsRealService } from './analytics.service';
import { analyticsProviders } from './analytics.providers';
import { DatabaseModule } from '../database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [AnalyticsController],
  providers: [
    ...analyticsProviders,
    {
      provide: 'AnalyticsService',
      useClass: AnalyticsRealService,
    },
    AnalyticsRealService,
  ],
  exports: [AnalyticsRealService],
})
export class AnalyticsModule {}
