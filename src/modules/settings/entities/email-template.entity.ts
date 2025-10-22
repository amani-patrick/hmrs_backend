import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

export enum TemplateType {
  WELCOME_EMAIL = 'welcome_email',
  LEAVE_APPROVED = 'leave_approved',
  LEAVE_REJECTED = 'leave_rejected',
  INTERVIEW_INVITATION = 'interview_invitation',
  OFFER_LETTER = 'offer_letter',
  PERFORMANCE_REVIEW = 'performance_review',
  TRAINING_INVITATION = 'training_invitation',
  PASSWORD_RESET = 'password_reset',
  PAYSLIP_GENERATED = 'payslip_generated',
  ONBOARDING_REMINDER = 'onboarding_reminder',
  EXIT_INTERVIEW = 'exit_interview',
  CUSTOM = 'custom',
}

@Entity({ name: 'email_templates' })
@Index(['tenantId', 'templateType'])
export class EmailTemplate {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  tenantId: string;

  @Column({ type: 'enum', enum: TemplateType })
  templateType: TemplateType;

  @Column({ type: 'varchar' })
  name: string;

  @Column({ type: 'varchar' })
  subject: string;

  @Column({ type: 'text' })
  body: string;

  @Column({ type: 'simple-array', nullable: true })
  variables: string[];

  @Column({ default: true })
  isActive: boolean;

  @Column({ default: false })
  isDefault: boolean;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ nullable: true })
  createdBy: string;

  @Column({ nullable: true })
  lastModifiedBy: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
