import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity({ name: 'documents' })
export class Document {
    @PrimaryGeneratedColumn('uuid') 
    id: string;
    
  @Column({ type: 'varchar' })
  title: string;
    
  @Column({ type: 'text' })
  fileUrl: string; // Link to cloud storage
    
  @Column({ type: 'varchar', nullable: true })
  category: string;
    
  @Column({ type: 'varchar', default: 'Draft' })
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
    
  @Column({ type: 'varchar', nullable: true })
  templateCategory: string;
    
  @Column({ type: 'uuid' })
  createdById: string;
    
    @Column({ type: 'text', nullable: true })
    description: string;
    
    @Column({ nullable: true })
    fileSize: number; // in bytes
    
  @Column({ type: 'varchar', nullable: true })
  fileType: string; // MIME type
    
  @Column({ type: 'varchar', default: '1.0' })
  version: string;
    
    @CreateDateColumn()
    createdAt: Date;
    
    @UpdateDateColumn()
    updatedAt: Date;
}
