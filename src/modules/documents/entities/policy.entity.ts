import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';

@Entity({ name: 'policies' })
export class Policy {

    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    title: string;

    @Column()
    documentId: string;

    @Column({ default: '1.0' })
    version: string;

    @Column({ type: 'date' })
    effectiveDate: Date;

    @Column({ type: 'date', nullable: true })
    nextReviewDate: Date;

    @Column('int')
    requiredAcknowledgments: number;

    @Column({ type: 'text', nullable: true })
    description: string;

    @Column({ default: 'Draft' })
    status: string;

    @Column({ nullable: true })
    category: string;

    @Column()
    createdById: string;

    @Column({ nullable: true })
    updatedById: string;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @OneToMany('PolicyAcknowledgment', 'policy')
    acknowledgments: any[];
}
