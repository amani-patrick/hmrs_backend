import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity({ name: 'contracts' })
export class Contract {
    @PrimaryGeneratedColumn('uuid') 
    id: string;
    
    @Column() 
    userId: string; // Employee the contract belongs to
    
    @Column() 
    type: string; // e.g., 'Full-Time Employment', 'Part-Time', 'Contractor'
    
    @Column() 
    fileUrl: string; // Link to the signed contract document
    
    @Column({ default: 'Draft' }) 
    status: string; // 'Draft', 'Active', 'Expired', 'Terminated'
    
    @Column('decimal', { precision: 12, scale: 2 }) 
    salary: number;
    
    @Column() 
    currency: string = 'USD'; // Default currency
    
    @Column({ type: 'date' }) 
    startDate: Date;
    
    @Column({ type: 'date', nullable: true }) 
    endDate: Date; // Null for 'Permanent' contracts
    
    @Column({ type: 'text', nullable: true })
    notes: string;
    
    @Column({ nullable: true })
    signedById: string; // User ID who signed the contract
    
    @Column({ type: 'timestamp', nullable: true })
    signedAt: Date;
    
    @Column({ nullable: true })
    templateId: string; // Reference to template document if created from template
    
    @Column({ default: '1.0' })
    version: string;
    
    @Column({ type: 'jsonb', nullable: true })
    customFields: any; // For any additional contract-specific fields
    
    @CreateDateColumn()
    createdAt: Date;
    
    @UpdateDateColumn()
    updatedAt: Date;
}
