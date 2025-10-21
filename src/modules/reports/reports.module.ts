import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module';
import { ReportsController } from './reports.controller';
import { ReportsService } from './reports.service';
import { reportsProviders } from './reports.providers';

@Module({
  imports: [DatabaseModule],
  controllers: [ReportsController],
  providers: [ReportsService, ...reportsProviders],
  exports: [ReportsService],
})
export class ReportsModule {}
