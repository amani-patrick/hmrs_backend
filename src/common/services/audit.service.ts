import { Injectable, Inject } from '@nestjs/common';
import { Repository } from 'typeorm';
import { AuditLog, AuditAction } from '../entities/audit-log.entity';
import { Request } from 'express';

@Injectable()
export class AuditService {
  constructor(
    @Inject('AUDIT_LOG_REPOSITORY')
    private readonly auditLogRepository: Repository<AuditLog>,
  ) {}

  /**
   * Create an audit log entry
   */
  async log(params: {
    tenantId: string;
    userId?: string;
    action: AuditAction;
    entityType: string;
    entityId?: string;
    oldValue?: any;
    newValue?: any;
    ipAddress?: string;
    userAgent?: string;
    description?: string;
  }): Promise<AuditLog> {
    const auditLog = this.auditLogRepository.create({
      tenantId: params.tenantId,
      userId: params.userId || null,
      action: params.action,
      entityType: params.entityType,
      entityId: params.entityId || null,
      oldValue: params.oldValue || null,
      newValue: params.newValue || null,
      ipAddress: params.ipAddress || null,
      userAgent: params.userAgent || null,
      description: params.description || null,
    });

    return this.auditLogRepository.save(auditLog);
  }

  /**
   * Log from HTTP request
   */
  async logFromRequest(
    request: Request,
    action: AuditAction,
    entityType: string,
    entityId?: string,
    oldValue?: any,
    newValue?: any,
    description?: string,
  ): Promise<AuditLog> {
    const tenantId = (request as any).tenantId || 'unknown';
    const userId = (request as any).user?.userId;
    const ipAddress = request.ip || request.socket.remoteAddress;
    const userAgent = request.headers['user-agent'];

    return this.log({
      tenantId,
      userId,
      action,
      entityType,
      entityId,
      oldValue,
      newValue,
      ipAddress,
      userAgent,
      description,
    });
  }

  /**
   * Get audit logs for a specific entity
   */
  async getEntityLogs(
    tenantId: string,
    entityType: string,
    entityId: string,
    limit: number = 50,
  ): Promise<AuditLog[]> {
    return this.auditLogRepository.find({
      where: { tenantId, entityType, entityId },
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }

  /**
   * Get audit logs for a specific user
   */
  async getUserLogs(
    tenantId: string,
    userId: string,
    limit: number = 50,
  ): Promise<AuditLog[]> {
    return this.auditLogRepository.find({
      where: { tenantId, userId },
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }

  /**
   * Get recent audit logs for tenant
   */
  async getRecentLogs(tenantId: string, limit: number = 100): Promise<AuditLog[]> {
    return this.auditLogRepository.find({
      where: { tenantId },
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }
}
