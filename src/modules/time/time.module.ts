import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { TimeController } from './time.controller';
import { TimeService } from './time.service';
import { TimeEntry } from './entities/time-entry.entity';
import { OvertimeRequest } from './entities/overtime-request.entity';
import { TENANT_DATA_SOURCE } from '../../tenancy/tenancy.symbols';

@Module({
  imports: [
    TypeOrmModule.forFeature([TimeEntry, OvertimeRequest]),
  ],
  controllers: [TimeController],
  providers: [
    {
      provide: 'TIME_ENTRY_REPOSITORY',
      useFactory: (tenantDataSource: DataSource) => {
        if (!tenantDataSource) {
          throw new Error('Accessing time entries without a valid Tenant Context');
        }
        return tenantDataSource.getRepository(TimeEntry);
      },
      inject: [TENANT_DATA_SOURCE],
    },
    TimeService,
  ],
  exports: [TimeService, 'TIME_ENTRY_REPOSITORY'],
})
export class TimeModule {}
