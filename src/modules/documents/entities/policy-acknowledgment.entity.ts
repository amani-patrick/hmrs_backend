import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';

@Entity({ name: 'policy_acknowledgments' })
export class PolicyAcknowledgment {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    policyId: string;

    @Column()
    userId: string;

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    acknowledgedAt: Date;

    @Column({ type: 'text', nullable: true })
    comments: string;

    @Column({ type: 'jsonb', nullable: true })
    metadata: Record<string, any>;

    @Column({ default: 'pending' })
    status: string;

    @ManyToOne('Policy', 'acknowledgments')
    @JoinColumn({ name: 'policyId' })
    policy: any;

    @ManyToOne('User')
    @JoinColumn({ name: 'userId' })
    user: any;
}
