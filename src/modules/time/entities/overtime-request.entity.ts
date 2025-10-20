import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity({ name: 'overtime_requests' })
export class OvertimeRequest {
    @PrimaryGeneratedColumn('uuid') 
    id: string;
    
    @Column() 
    userId: string;
    
    @Column({ type: 'timestamp' }) 
    startTime: Date;
    
    @Column({ type: 'timestamp' }) 
    endTime: Date;
    
    @Column('decimal', { precision: 5, scale: 2 }) 
    hoursRequested: number;
    
    @Column() 
    reason: string;
    
    @Column({ default: 'Pending' }) 
    status: string; // 'Pending', 'Approved', 'Rejected'
    
    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    requestedAt: Date;
    
    @Column({ nullable: true })
    approvedById: string;
    
    @Column({ type: 'timestamp', nullable: true })
    approvedAt: Date;
    
    @Column({ type: 'text', nullable: true })
    approvalNotes: string;
}
