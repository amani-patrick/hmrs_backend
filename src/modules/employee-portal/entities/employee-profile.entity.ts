import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

@Entity({ name: 'employee_profiles' })
@Index(['tenantId', 'userId'], { unique: true })
export class EmployeeProfile {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  tenantId: string;

  @Column({ type: 'uuid' })
  userId: string;

  @Column({ type: 'jsonb', nullable: true })
  personalInfo: {
    dateOfBirth?: Date;
    gender?: string;
    maritalStatus?: string;
    nationality?: string;
    bloodGroup?: string;
  };

  @Column({ type: 'jsonb', nullable: true })
  contactInfo: {
    personalEmail?: string;
    personalPhone?: string;
    alternatePhone?: string;
    address?: {
      street: string;
      city: string;
      state: string;
      zipCode: string;
      country: string;
    };
  };

  @Column({ type: 'jsonb', nullable: true })
  emergencyContacts: Array<{
    name: string;
    relationship: string;
    phone: string;
    email?: string;
    isPrimary: boolean;
  }>;

  @Column({ type: 'jsonb', nullable: true })
  bankDetails: {
    bankName?: string;
    accountNumber?: string;
    accountHolderName?: string;
    routingNumber?: string;
    swiftCode?: string;
  };

  @Column({ type: 'jsonb', nullable: true })
  taxInformation: {
    taxId?: string;
    taxFilingStatus?: string;
    allowances?: number;
    additionalWithholding?: number;
  };

  @Column({ type: 'jsonb', nullable: true })
  dependents: Array<{
    name: string;
    relationship: string;
    dateOfBirth: Date;
    isDependent: boolean;
  }>;

  @Column({ type: 'jsonb', nullable: true })
  education: Array<{
    institution: string;
    degree: string;
    fieldOfStudy: string;
    startDate: Date;
    endDate?: Date;
    gpa?: string;
  }>;

  @Column({ type: 'jsonb', nullable: true })
  certifications: Array<{
    name: string;
    issuingOrganization: string;
    issueDate: Date;
    expiryDate?: Date;
    credentialId?: string;
  }>;

  @Column({ type: 'jsonb', nullable: true })
  languages: Array<{
    language: string;
    proficiency: 'basic' | 'intermediate' | 'fluent' | 'native';
  }>;

  @Column({ type: 'jsonb', nullable: true })
  skills: string[];

  @Column({ nullable: true })
  profilePictureUrl: string;

  @Column({ nullable: true })
  resumeUrl: string;

  @Column({ type: 'text', nullable: true })
  bio: string;

  @Column({ default: false })
  profileCompleted: boolean;

  @Column({ type: 'int', default: 0 })
  profileCompletionPercentage: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
