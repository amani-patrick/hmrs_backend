import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index } from 'typeorm';

export enum AccessAction {
  VIEW = 'view',
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  EXPORT = 'export',
  PRINT = 'print',
  DOWNLOAD = 'download',
}

@Entity({ name: 'data_access_logs' })
@Index(['tenantId', 'userId'])
@Index(['tenantId', 'entityType'])
@Index(['tenantId', 'accessedAt'])
export class DataAccessLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  tenantId: string;

  @Column({ type: 'uuid' })
  userId: string;

  @Column({ type: 'varchar' })
  userName: string;

  @Column({ type: 'enum', enum: AccessAction })
  action: AccessAction;

  @Column({ type: 'varchar' })
  entityType: string; // e.g., 'User', 'PayrollRecord'

  @Column({ type: 'varchar' })
  entityId: string;

  @Column({ type: 'varchar', nullable: true })
  entityDescription: string | null;

  @Column({ type: 'jsonb', nullable: true })
  accessedFields: string[]; // Which fields were accessed

  @Column({ type: 'varchar', nullable: true })
  purpose: string | null;

  @Column({ type: 'varchar', nullable: true })
  ipAddress: string | null;

  @Column({ type: 'varchar', nullable: true })
  userAgent: string | null;

  @Column({ default: true })
  isAuthorized: boolean;

  @Column({ type: 'varchar', nullable: true })
  authorizationReason: string | null;

  @Column({ type: 'timestamp' })
  accessedAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;
}
