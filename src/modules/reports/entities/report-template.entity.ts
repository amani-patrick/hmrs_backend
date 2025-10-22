import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export enum ReportType {
  ANALYTICS = 'analytics',
  FINANCIAL = 'financial',
  OPERATIONAL = 'operational',
  COMPLIANCE = 'compliance',
  REGULATORY = 'regulatory',
  CUSTOM = 'custom',
}

export enum ReportCategory {
  WORKFORCE = 'workforce',
  COMPENSATION = 'compensation',
  PERFORMANCE = 'performance',
  LEARNING = 'learning',
  LEGAL = 'legal',
  TALENT = 'talent',
  BENEFITS = 'benefits',
  ATTENDANCE = 'attendance',
  RISK_MANAGEMENT = 'risk_management',
  AUDIT = 'audit',
  TAX = 'tax',
  PROJECT = 'project',
  PRODUCTIVITY = 'productivity',
}

export enum ReportFormat {
  PDF = 'pdf',
  EXCEL = 'excel',
  CSV = 'csv',
  POWERPOINT = 'powerpoint',
  JSON = 'json',
}

@Entity({ name: 'report_templates' })
export class ReportTemplate {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  tenantId: string;

  @Column({ type: 'varchar' })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ type: 'enum', enum: ReportType })
  type: ReportType;

  @Column({ type: 'enum', enum: ReportCategory })
  category: ReportCategory;

  @Column({ type: 'enum', enum: ReportFormat, default: ReportFormat.PDF })
  defaultFormat: ReportFormat;

  @Column({ type: 'jsonb' })
  dataSource: {
    entities: string[]; // e.g., ['User', 'PayrollRecord']
    filters?: Record<string, any>;
    aggregations?: Record<string, any>;
  };

  @Column({ type: 'jsonb', nullable: true })
  columns: Array<{
    field: string;
    label: string;
    type: string;
    format?: string;
  }>;

  @Column({ type: 'jsonb', nullable: true })
  parameters: Array<{
    name: string;
    label: string;
    type: 'string' | 'number' | 'date' | 'boolean' | 'select';
    required: boolean;
    defaultValue?: any;
    options?: Array<{ label: string; value: any }>;
  }>;

  @Column({ type: 'jsonb', nullable: true })
  chartConfig: {
    enabled: boolean;
    type?: 'bar' | 'line' | 'pie' | 'area';
    xAxis?: string;
    yAxis?: string;
  };

  @Column({ default: true })
  isActive: boolean;

  @Column({ default: false })
  isSystem: boolean; // Pre-defined system templates

  @Column({ type: 'jsonb', nullable: true })
  permissions: {
    roles: string[];
    departments?: string[];
  };

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ type: 'varchar', nullable: true })
  createdBy: string | null;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;
}
