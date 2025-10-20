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

  @Column()
  tenantId: string;

  @Column()
  userId: string;

  @Column()
  userName: string;

  @Column({ type: 'enum', enum: AccessAction })
  action: AccessAction;

  @Column()
  entityType: string; // e.g., 'User', 'PayrollRecord'

  @Column()
  entityId: string;

  @Column({ nullable: true })
  entityDescription: string | null;

  @Column({ type: 'jsonb', nullable: true })
  accessedFields: string[]; // Which fields were accessed

  @Column({ nullable: true })
  purpose: string | null;

  @Column({ nullable: true })
  ipAddress: string | null;

  @Column({ nullable: true })
  userAgent: string | null;

  @Column({ default: true })
  isAuthorized: boolean;

  @Column({ nullable: true })
  authorizationReason: string | null;

  @Column({ type: 'timestamp' })
  accessedAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;
}
