import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export enum WidgetType {
  METRIC = 'metric',
  CHART = 'chart',
  TABLE = 'table',
  GAUGE = 'gauge',
  TREND = 'trend',
}

export enum ChartType {
  LINE = 'line',
  BAR = 'bar',
  PIE = 'pie',
  DOUGHNUT = 'doughnut',
  AREA = 'area',
}

@Entity({ name: 'dashboard_widgets' })
export class DashboardWidget {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  tenantId: string;

  @Column({ type: 'uuid' })
  userId: string;

  @Column({ type: 'varchar' })
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ type: 'enum', enum: WidgetType })
  widgetType: WidgetType;

  @Column({ type: 'enum', enum: ChartType, nullable: true })
  chartType: ChartType | null;

  @Column({ type: 'jsonb' })
  dataSource: {
    metric: string;
    filters?: any;
    groupBy?: string;
    aggregation?: string;
  };

  @Column({ type: 'jsonb', nullable: true })
  configuration: {
    refreshInterval?: number; 
    colorScheme?: string[];
    showLegend?: boolean;
    showLabels?: boolean;
    size?: 'small' | 'medium' | 'large';
    position?: { x: number; y: number; w: number; h: number };
  };

  @Column({ default: true })
  isActive: boolean;

  @Column({ type: 'int', default: 0 })
  sortOrder: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
