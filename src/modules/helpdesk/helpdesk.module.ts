import { Module } from '@nestjs/common';
import { HelpdeskController } from './helpdesk.controller';
import { HelpdeskService } from './helpdesk.service';
import { helpdeskProviders } from './helpdesk.providers';
import { DatabaseModule } from '../database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [HelpdeskController],
  providers: [...helpdeskProviders, HelpdeskService],
  exports: [HelpdeskService],
})
export class HelpdeskModule {}
