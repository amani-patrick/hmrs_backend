import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany, ManyToOne, JoinColumn, OneToOne } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Position } from '../../position/entities/position.entity';

@Entity('departments')
export class Department {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  location: string;

  @Column({ default: true })
  isActive: boolean;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  // Self-referential relationship for sub-departments
  @Column({ type: 'uuid', nullable: true })
  parentDepartmentId: string | null;

  @ManyToOne(() => Department, department => department.childDepartments, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'parentDepartmentId' })
  parentDepartment: Department;

  @OneToMany(() => Department, department => department.parentDepartment)
  childDepartments: Department[];

  // Department head relationship
  @Column({ type: 'uuid', nullable: true })
  headId: string | null;

  @OneToOne(() => User, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'headId' })
  head: User;

  // Relationships
  @OneToMany(() => User, user => user.department)
  members: User[];

  @OneToMany(() => Position, position => position.department)
  positions: Position[];

  // Timestamps
  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  constructor(partial?: Partial<Department>) {
    if (partial) {
      Object.assign(this, partial);
    }
  }
}