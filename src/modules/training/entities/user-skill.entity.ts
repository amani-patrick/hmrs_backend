import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, Index } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Skill } from './skill.entity';

export enum ProficiencyLevel {
  NOVICE = 1,
  BEGINNER = 2,
  INTERMEDIATE = 3,
  ADVANCED = 4,
  EXPERT = 5,
}

@Entity({ name: 'user_skills' })
@Index(['tenantId', 'userId'])
export class UserSkill {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  tenantId: string;

  @Column()
  userId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  skillId: string;

  @ManyToOne(() => Skill)
  @JoinColumn({ name: 'skillId' })
  skill: Skill;

  @Column({ type: 'enum', enum: ProficiencyLevel })
  proficiencyLevel: ProficiencyLevel;

  @Column({ type: 'decimal', precision: 3, scale: 2, nullable: true })
  assessmentScore: number | null;

  @Column({ type: 'date', nullable: true })
  lastAssessedDate: Date | null;

  @Column({ type: 'date', nullable: true })
  acquiredDate: Date | null;

  @Column({ type: 'jsonb', nullable: true })
  certifications: string[];

  @Column({ type: 'text', nullable: true })
  notes: string | null;

  @Column({ nullable: true })
  endorsedBy: string | null;

  @Column({ default: false })
  isEndorsed: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
