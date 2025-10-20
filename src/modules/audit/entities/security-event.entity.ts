import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index } from 'typeorm';

export enum SecurityEventType {
  UNAUTHORIZED_ACCESS = 'unauthorized_access',
  DATA_BREACH = 'data_breach',
  FAILED_LOGIN = 'failed_login',
  POLICY_VIOLATION = 'policy_violation',
  SUSPICIOUS_ACTIVITY = 'suspicious_activity',
  PRIVILEGE_ESCALATION = 'privilege_escalation',
  DATA_EXPORT = 'data_export',
  SYSTEM_ANOMALY = 'system_anomaly',
}

export enum SecuritySeverity {
  INFO = 'info',
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

export enum SecurityEventStatus {
  NEW = 'new',
  INVESTIGATING = 'investigating',
  RESOLVED = 'resolved',
  FALSE_POSITIVE = 'false_positive',
  ESCALATED = 'escalated',
}

@Entity({ name: 'security_events' })
@Index(['tenantId', 'eventType'])
@Index(['tenantId', 'severity'])
@Index(['tenantId', 'userId'])
@Index(['tenantId', 'occurredAt'])
export class SecurityEvent {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  tenantId: string;

  @Column({ type: 'enum', enum: SecurityEventType })
  eventType: SecurityEventType;

  @Column({ type: 'enum', enum: SecuritySeverity })
  severity: SecuritySeverity;

  @Column({ type: 'enum', enum: SecurityEventStatus, default: SecurityEventStatus.NEW })
  status: SecurityEventStatus;

  @Column({ nullable: true })
  userId: string | null;

  @Column({ nullable: true })
  ipAddress: string | null;

  @Column({ nullable: true })
  userAgent: string | null;

  @Column({ nullable: true })
  resource: string | null; // e.g., '/api/users'

  @Column({ nullable: true })
  action: string | null; // e.g., 'DELETE', 'UPDATE'

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'jsonb', nullable: true })
  eventData: Record<string, any>;

  @Column({ nullable: true })
  assignedTo: string | null;

  @Column({ type: 'text', nullable: true })
  resolution: string | null;

  @Column({ type: 'timestamp', nullable: true })
  resolvedAt: Date | null;

  @Column({ type: 'timestamp' })
  occurredAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;
}
