import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity({ name: 'benefits_plans' })
export class BenefitsPlan {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string; // e.g., 'Health Insurance Premium'

  @Column({ type: 'text' })
  description: string;

  @Column('decimal', { precision: 10, scale: 2 })
  totalMonthlyCost: number;

  @Column('decimal', { precision: 10, scale: 2 })
  employeeContribution: number;

  @Column('int')
  maxEnrollment: number;
  
  @Column('int', { default: 0 })
  currentEnrollment: number;
  
  @Column({ type: 'date', nullable: true })
  renewalDate: Date;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
