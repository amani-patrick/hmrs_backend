import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Role } from '../../../common/enums/roles.enum';
import { Department } from '../../department/entities/department.entity';
import { SalaryGrade } from '../../payroll/entities/salary-grade.entity';
import { Position } from '../../position/entities/position.entity';

@Entity({ name: 'users' }) 
export class User {
  @PrimaryGeneratedColumn('uuid') 
  id: string;

  @Column({ unique: true })
  email: string;

  @Column({ select: false, nullable: true })
  password: string | null;

  @Column({ type: 'enum', enum: Role, default: Role.EMPLOYEE }) 
  role: Role; 
  
  @Column({ default: true })
  isActive: boolean;

  @Column({ nullable: true })
  firstName: string | null;

  @Column({ nullable: true })
  lastName: string | null;

  @CreateDateColumn()
  joinedAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ nullable: true })
  position: string | null;

  @Column({ nullable: true })
  phoneNumber: string | null;

  @Column({ nullable: true })
  location: string | null;

  @Column({ nullable: true })
  profilePictureUrl: string | null;

  @ManyToOne(() => Position, { nullable: true })
  @JoinColumn({ name: 'positionId' })
  positionRef: Position | null;

  @Column({ type: 'uuid', nullable: true })
  positionId: string | null;

  @Column({ nullable: true })
  tenantId: string | null;

  @ManyToOne(() => Department, department => department.members, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'departmentId' })
  department: Department | null;

  @Column({ type: 'uuid', nullable: true })
  departmentId: string | null;

  @ManyToOne(() => SalaryGrade, { nullable: true, eager: false })
  @JoinColumn({ name: 'salaryGradeId' })
  salaryGrade: SalaryGrade | null;

  @Column({ type: 'uuid', nullable: true })
  salaryGradeId: string | null;
}