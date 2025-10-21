import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { EmployeeProfile } from './entities/employee-profile.entity';
import { EmployeeDocument, DocumentStatus } from './entities/employee-document.entity';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UploadDocumentDto } from './dto/upload-document.dto';

@Injectable()
export class EmployeePortalService {
  constructor(
    @Inject('EMPLOYEE_PROFILE_REPOSITORY')
    private readonly profileRepository: Repository<EmployeeProfile>,
    @Inject('EMPLOYEE_DOCUMENT_REPOSITORY')
    private readonly documentRepository: Repository<EmployeeDocument>,
  ) {}

  // ==================== PROFILE MANAGEMENT ====================

  async getMyProfile(tenantId: string, userId: string): Promise<EmployeeProfile> {
    let profile = await this.profileRepository.findOne({
      where: { tenantId, userId },
    });

    if (!profile) {
      // Create default profile
      profile = await this.createDefaultProfile(tenantId, userId);
    }

    return profile;
  }

  async updateMyProfile(
    tenantId: string,
    userId: string,
    dto: UpdateProfileDto,
  ): Promise<EmployeeProfile> {
    let profile = await this.profileRepository.findOne({
      where: { tenantId, userId },
    });

    if (!profile) {
      profile = await this.createDefaultProfile(tenantId, userId);
    }

    // Update fields
    Object.assign(profile, dto);

    // Calculate completion percentage
    profile.profileCompletionPercentage = this.calculateCompletionPercentage(profile);
    profile.profileCompleted = profile.profileCompletionPercentage === 100;

    return this.profileRepository.save(profile);
  }

  private async createDefaultProfile(tenantId: string, userId: string): Promise<EmployeeProfile> {
    const profile = this.profileRepository.create({
      tenantId,
      userId,
      profileCompleted: false,
      profileCompletionPercentage: 0,
    });

    return this.profileRepository.save(profile);
  }

  private calculateCompletionPercentage(profile: EmployeeProfile): number {
    const fields = [
      profile.personalInfo,
      profile.contactInfo,
      profile.emergencyContacts?.length > 0,
      profile.bankDetails,
      profile.taxInformation,
      profile.education?.length > 0,
      profile.skills?.length > 0,
      profile.profilePictureUrl,
      profile.bio,
    ];

    const completed = fields.filter(field => field !== null && field !== undefined).length;
    return Math.round((completed / fields.length) * 100);
  }

  async getProfileCompletionStatus(tenantId: string, userId: string) {
    const profile = await this.getMyProfile(tenantId, userId);

    return {
      completed: profile.profileCompleted,
      percentage: profile.profileCompletionPercentage,
      missingFields: this.getMissingFields(profile),
    };
  }

  private getMissingFields(profile: EmployeeProfile): string[] {
    const missing: string[] = [];

    if (!profile.personalInfo) missing.push('Personal Information');
    if (!profile.contactInfo) missing.push('Contact Information');
    if (!profile.emergencyContacts?.length) missing.push('Emergency Contacts');
    if (!profile.bankDetails) missing.push('Bank Details');
    if (!profile.taxInformation) missing.push('Tax Information');
    if (!profile.education?.length) missing.push('Education');
    if (!profile.skills?.length) missing.push('Skills');
    if (!profile.profilePictureUrl) missing.push('Profile Picture');
    if (!profile.bio) missing.push('Bio');

    return missing;
  }

  // ==================== DOCUMENT MANAGEMENT ====================

  async uploadDocument(
    tenantId: string,
    userId: string,
    dto: UploadDocumentDto,
  ): Promise<EmployeeDocument> {
    const document = this.documentRepository.create({
      ...dto,
      tenantId,
      userId,
      status: DocumentStatus.PENDING_REVIEW,
    });

    return this.documentRepository.save(document);
  }

  async getMyDocuments(
    tenantId: string,
    userId: string,
    filters?: { category?: string; status?: DocumentStatus },
  ): Promise<EmployeeDocument[]> {
    const where: any = { tenantId, userId };

    if (filters?.category) where.category = filters.category;
    if (filters?.status) where.status = filters.status;

    return this.documentRepository.find({
      where,
      order: { createdAt: 'DESC' },
    });
  }

  async getDocumentById(
    tenantId: string,
    userId: string,
    id: string,
  ): Promise<EmployeeDocument> {
    const document = await this.documentRepository.findOne({
      where: { id, tenantId, userId },
    });

    if (!document) {
      throw new NotFoundException('Document not found');
    }

    return document;
  }

  async deleteDocument(tenantId: string, userId: string, id: string): Promise<void> {
    const result = await this.documentRepository.delete({
      id,
      tenantId,
      userId,
    });

    if (result.affected === 0) {
      throw new NotFoundException('Document not found');
    }
  }

  async getDocumentStats(tenantId: string, userId: string) {
    const documents = await this.getMyDocuments(tenantId, userId);

    return {
      total: documents.length,
      pending: documents.filter(d => d.status === DocumentStatus.PENDING_REVIEW).length,
      approved: documents.filter(d => d.status === DocumentStatus.APPROVED).length,
      rejected: documents.filter(d => d.status === DocumentStatus.REJECTED).length,
      expired: documents.filter(d => d.status === DocumentStatus.EXPIRED).length,
      byCategory: this.groupByCategory(documents),
    };
  }

  private groupByCategory(documents: EmployeeDocument[]) {
    const groups: any = {};

    documents.forEach(doc => {
      if (!groups[doc.category]) {
        groups[doc.category] = 0;
      }
      groups[doc.category]++;
    });

    return groups;
  }

  // ==================== HR REVIEW (For HR Portal) ====================

  async reviewDocument(
    tenantId: string,
    documentId: string,
    reviewedBy: string,
    status: DocumentStatus,
    notes?: string,
    rejectionReason?: string,
  ): Promise<EmployeeDocument> {
    const document = await this.documentRepository.findOne({
      where: { id: documentId, tenantId },
    });

    if (!document) {
      throw new NotFoundException('Document not found');
    }

    document.status = status;
    document.isVerified = status === DocumentStatus.APPROVED;
    document.verifiedBy = reviewedBy;
    document.verifiedAt = new Date();
    document.reviewNotes = notes || '';
    document.rejectionReason = rejectionReason || '';

    return this.documentRepository.save(document);
  }

  async getPendingDocuments(tenantId: string): Promise<EmployeeDocument[]> {
    return this.documentRepository.find({
      where: { tenantId, status: DocumentStatus.PENDING_REVIEW },
      order: { createdAt: 'ASC' },
    });
  }

  async getExpiringDocuments(tenantId: string, days: number = 30): Promise<EmployeeDocument[]> {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + days);

    // Would need proper query builder for this
    const documents = await this.documentRepository.find({
      where: { tenantId },
    });

    return documents.filter(doc => {
      if (!doc.expiryDate) return false;
      const expiry = new Date(doc.expiryDate);
      return expiry <= futureDate && expiry > new Date();
    });
  }
}
