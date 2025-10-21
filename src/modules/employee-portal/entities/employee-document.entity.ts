import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

export enum DocumentCategory {
  PERSONAL = 'personal',
  IDENTIFICATION = 'identification',
  EDUCATION = 'education',
  CERTIFICATION = 'certification',
  MEDICAL = 'medical',
  TAX = 'tax',
  EMPLOYMENT = 'employment',
  OTHER = 'other',
}

export enum DocumentStatus {
  PENDING_REVIEW = 'pending_review',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  EXPIRED = 'expired',
}

@Entity({ name: 'employee_documents' })
@Index(['tenantId', 'userId'])
@Index(['tenantId', 'status'])
export class EmployeeDocument {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  tenantId: string;

  @Column()
  userId: string;

  @Column()
  documentName: string;

  @Column({ type: 'enum', enum: DocumentCategory })
  category: DocumentCategory;

  @Column()
  fileUrl: string;

  @Column()
  fileName: string;

  @Column()
  fileSize: number;

  @Column()
  mimeType: string;

  @Column({ type: 'enum', enum: DocumentStatus, default: DocumentStatus.PENDING_REVIEW })
  status: DocumentStatus;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ nullable: true })
  documentNumber: string;

  @Column({ type: 'date', nullable: true })
  issueDate: Date;

  @Column({ type: 'date', nullable: true })
  expiryDate: Date;

  @Column({ nullable: true })
  issuingAuthority: string;

  @Column({ default: false })
  isVerified: boolean;

  @Column({ nullable: true })
  verifiedBy: string;

  @Column({ type: 'timestamp', nullable: true })
  verifiedAt: Date;

  @Column({ type: 'text', nullable: true })
  reviewNotes: string;

  @Column({ nullable: true })
  rejectionReason: string;

  @Column({ default: false })
  isConfidential: boolean;

  @Column({ type: 'simple-array', nullable: true })
  tags: string[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
