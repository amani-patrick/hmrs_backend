import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity({ name: 'salary_grades' })
export class SalaryGrade {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  name: string; // e.g., 'Grade A', 'Executive', etc.

  @Column('decimal', { precision: 10, scale: 2 })
  baseSalary: number;

  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  maxSalary: number;

  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  minSalary: number;

  @Column('jsonb', { nullable: true })
  allowances: {
    housing?: number;
    transport?: number;
    medical?: number;
    [key: string]: number | undefined;
  };

  @Column('jsonb', { nullable: true })
  benefits: {
    annualLeaveDays?: number;
    sickLeaveDays?: number;
    bonusPercentage?: number;
    [key: string]: any;
  };

  @Column({ default: true })
  isActive: boolean;

  @Column({ type: 'text', nullable: true })
  description: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relations
  @OneToMany(() => User, user => user.salaryGrade)
  users: User[];
}
