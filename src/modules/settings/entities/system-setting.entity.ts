import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

export enum SettingCategory {
  GENERAL = 'general',
  EMAIL = 'email',
  NOTIFICATION = 'notification',
  SECURITY = 'security',
  LEAVE = 'leave',
  ATTENDANCE = 'attendance',
  PAYROLL = 'payroll',
  RECRUITMENT = 'recruitment',
  PERFORMANCE = 'performance',
  TRAINING = 'training',
}

@Entity({ name: 'system_settings' })
@Index(['tenantId', 'key'], { unique: true })
export class SystemSetting {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  tenantId: string;

  @Column()
  key: string;

  @Column({ type: 'text' })
  value: string;

  @Column({ type: 'enum', enum: SettingCategory })
  category: SettingCategory;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ default: false })
  isEncrypted: boolean;

  @Column({ default: true })
  isEditable: boolean;

  @Column({ nullable: true })
  lastModifiedBy: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
