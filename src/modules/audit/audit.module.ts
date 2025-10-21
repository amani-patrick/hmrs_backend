import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module';
import { AuditController } from './audit.controller';
import { AuditService } from './audit.service';
import { auditProviders } from './audit.providers';

@Module({
  imports: [DatabaseModule],
  controllers: [AuditController],
  providers: [AuditService, ...auditProviders],
  exports: [AuditService],
})
export class AuditModule {}
