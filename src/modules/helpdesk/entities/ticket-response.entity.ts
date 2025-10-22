import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

@Entity({ name: 'ticket_responses' })
@Index(['tenantId', 'ticketId'])
export class TicketResponse {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  tenantId: string;

  @Column({ type: 'varchar' })
  ticketId: string;

  @Column({ type: 'text' })
  message: string;

  @Column({ type: 'varchar' })
  respondedBy: string;

  @Column({ nullable: true })
  respondedByName: string;

  @Column({ default: false })
  isInternal: boolean;

  @Column({ type: 'simple-array', nullable: true })
  attachments: string[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
