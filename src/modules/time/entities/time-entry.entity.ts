import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity({ name: 'time_entries' })
export class TimeEntry {
    @PrimaryGeneratedColumn('uuid') 
    id: string;
    
    @Column({ type: 'uuid' })
  userId: string;
    
    @Column({ type: 'timestamp' }) 
    clockInTime: Date;
    
    @Column({ type: 'timestamp', nullable: true }) 
    clockOutTime: Date;
    
    @Column({ nullable: true }) 
    projectId: string;
    
    @Column('decimal', { precision: 5, scale: 2, default: 0 }) 
    hours: number;
    
    @Column({ default: 'Standard' }) 
    type: string; // 'Standard', 'Overtime', 'Remote'
    
    @Column({ nullable: true })
    location: string;
    
    @Column({ type: 'text', nullable: true })
    notes: string;
}
