import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export enum EventStatus {
  SCHEDULED = 'scheduled',
  CANCELLED = 'cancelled',
  COMPLETED = 'completed',
}

export interface CalendarEventAttendee {
  id: string;
  name: string;
  email: string;
  status: 'accepted' | 'declined' | 'tentative' | 'needsAction';
  responseTime?: Date;
}

@Entity({ name: 'calendar_events' })
export class CalendarEvent {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  tenantId: string;

  @Column()
  title: string;

  @Column('text', { nullable: true })
  description?: string;

  @Column({ type: 'timestamp' })
  startTime: Date;

  @Column({ type: 'timestamp' })
  endTime: Date;

  @Column({ default: 'meeting' })
  type: string;

  @Column({ nullable: true })
  location?: string;

  @Column({ type: 'enum', enum: EventStatus, default: EventStatus.SCHEDULED })
  status: EventStatus;

  @Column({ nullable: true })
  relatedEntityId?: string;

  @Column({ nullable: true })
  relatedEntityType?: string;

  @Column('jsonb', { default: [] })
  attendees: CalendarEventAttendee[];

  @Column({ nullable: true })
  timeZone?: string;

  @Column({ nullable: true })
  recurrence?: string;

  @Column({ nullable: true })
  colorId?: string;

  @Column({ default: false })
  isAllDay: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ type: 'uuid', nullable: true })
  createdById?: string;

  @Column({ type: 'uuid', nullable: true })
  updatedById?: string;
}
