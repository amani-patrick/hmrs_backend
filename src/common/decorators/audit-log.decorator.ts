import { SetMetadata } from '@nestjs/common';
import { AuditAction } from '../entities/audit-log.entity';

export const AUDIT_LOG_KEY = 'audit_log';

export interface AuditLogMetadata {
  action: AuditAction;
  entityType: string;
  description?: string;
}

export const AuditLog = (metadata: AuditLogMetadata) =>
  SetMetadata(AUDIT_LOG_KEY, metadata);
