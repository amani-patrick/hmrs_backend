import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Role } from '../../../common/enums/roles.enum';
import { Department } from '../../department/entities/department.entity';
import { SalaryGrade } from '../../payroll/entities/salary-grade.entity';
import { Position } from '../../position/entities/position.entity';

@Entity({ name: 'users' }) 
export class User {
  @PrimaryGeneratedColumn('uuid') 
  id: string;

  @Column({ type: 'varchar', unique: true })
  email: string;

  @Column({ type: 'text', select: false, nullable: true })
  password: string | null;

  @Column({ type: 'enum', enum: Role, default: Role.EMPLOYEE }) 
  role: Role; 
  
  @Column({ default: true })
  isActive: boolean;

  @Column({ type: 'varchar', nullable: true })
  firstName: string | null;

  @Column({ type: 'varchar', nullable: true })
  lastName: string | null;

  @CreateDateColumn()
  joinedAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ type: 'varchar', nullable: true })
  position: string | null;

  @Column({ type: 'varchar', nullable: true })
  phoneNumber: string | null;

  @Column({ type: 'varchar', nullable: true })
  location: string | null;

  @Column({ type: 'text', nullable: true })
  profilePictureUrl: string | null;

  @ManyToOne(() => Position, { nullable: true })
  @JoinColumn({ name: 'positionId' })
  positionRef: Position | null;

  @Column({ type: 'uuid', nullable: true })
  positionId: string | null;

  @Column({ type: 'uuid', nullable: true })
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

  @Column({ type: 'varchar', nullable: true })
  invitationToken: string | null;

  @Column({ type: 'timestamp', nullable: true })
  invitationExpiry: Date | null;
}