import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

export enum TicketCategory {
  IT_SUPPORT = 'it_support',
  HR_INQUIRY = 'hr_inquiry',
  PAYROLL = 'payroll',
  LEAVE = 'leave',
  ATTENDANCE = 'attendance',
  PERFORMANCE = 'performance',
  TRAINING = 'training',
  BENEFITS = 'benefits',
  FACILITIES = 'facilities',
  OTHER = 'other',
}

export enum TicketPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent',
}

export enum TicketStatus {
  OPEN = 'open',
  IN_PROGRESS = 'in_progress',
  WAITING_ON_USER = 'waiting_on_user',
  RESOLVED = 'resolved',
  CLOSED = 'closed',
  CANCELLED = 'cancelled',
}

@Entity({ name: 'helpdesk_tickets' })
@Index(['tenantId', 'createdBy'])
@Index(['tenantId', 'status'])
@Index(['tenantId', 'assignedTo'])
export class Ticket {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  tenantId: string;

  @Column({ unique: true })
  ticketNumber: string;

  @Column()
  subject: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'enum', enum: TicketCategory })
  category: TicketCategory;

  @Column({ type: 'enum', enum: TicketPriority, default: TicketPriority.MEDIUM })
  priority: TicketPriority;

  @Column({ type: 'enum', enum: TicketStatus, default: TicketStatus.OPEN })
  status: TicketStatus;

  @Column()
  createdBy: string;

  @Column({ nullable: true })
  createdByName: string;

  @Column({ nullable: true })
  assignedTo: string;

  @Column({ nullable: true })
  assignedToName: string;

  @Column({ type: 'timestamp', nullable: true })
  assignedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  resolvedAt: Date;

  @Column({ nullable: true })
  resolvedBy: string;

  @Column({ type: 'timestamp', nullable: true })
  closedAt: Date;

  @Column({ nullable: true })
  closedBy: string;

  @Column({ type: 'text', nullable: true })
  resolution: string;

  @Column({ type: 'simple-array', nullable: true })
  attachments: string[];

  @Column({ type: 'simple-array', nullable: true })
  tags: string[];

  @Column({ type: 'int', nullable: true })
  satisfactionRating: number;

  @Column({ type: 'text', nullable: true })
  feedback: string;

  @Column({ nullable: true })
  relatedTicketId: string;

  @Column({ default: 0 })
  responseCount: number;

  @Column({ type: 'timestamp', nullable: true })
  lastResponseAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
