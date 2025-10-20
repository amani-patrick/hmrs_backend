import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity({ name: 'documents' })
export class Document {
    @PrimaryGeneratedColumn('uuid') 
    id: string;
    
    @Column() 
    title: string;
    
    @Column() 
    fileUrl: string; // Link to cloud storage
    
    @Column({ nullable: true }) 
    category: string;
    
    @Column({ default: 'Draft' }) 
    status: string; // 'Published', 'Draft', 'Archived'
    
    @Column({ default: 0 }) 
    downloads: number;
    
    @Column({ default: 0 }) 
    views: number;
    
    @Column('jsonb', { default: {} }) 
    accessRules: any; // e.g., { department: ['Engineering'] }
    
    @Column({ type: 'date', nullable: true }) 
    expiresOn: Date;
    
    @Column({ default: false })
    isTemplate: boolean;
    
    @Column({ nullable: true })
    templateCategory: string;
    
    @Column()
    createdById: string;
    
    @Column({ type: 'text', nullable: true })
    description: string;
    
    @Column({ nullable: true })
    fileSize: number; // in bytes
    
    @Column({ nullable: true })
    fileType: string; // MIME type
    
    @Column({ default: '1.0' })
    version: string;
    
    @CreateDateColumn()
    createdAt: Date;
    
    @UpdateDateColumn()
    updatedAt: Date;
}
