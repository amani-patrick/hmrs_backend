import { Injectable, Inject, NotFoundException, BadRequestException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { BenefitPlan } from './entities/benefit-plan.entity';
import { BenefitEnrollment, EnrollmentStatus } from './entities/benefit-enrollment.entity';
import { BenefitClaim, ClaimStatus } from './entities/benefit-claim.entity';
import { CreateBenefitPlanDto } from './dto/create-benefit-plan.dto';
import { EnrollBenefitDto } from './dto/enroll-benefit.dto';
import { SubmitClaimDto } from './dto/submit-claim.dto';

@Injectable()
export class BenefitsService {
  constructor(
    @Inject('BENEFIT_PLAN_REPOSITORY')
    private readonly planRepository: Repository<BenefitPlan>,
    @Inject('BENEFIT_ENROLLMENT_REPOSITORY')
    private readonly enrollmentRepository: Repository<BenefitEnrollment>,
    @Inject('BENEFIT_CLAIM_REPOSITORY')
    private readonly claimRepository: Repository<BenefitClaim>,
  ) {}

  // ==================== BENEFIT PLANS ====================

  async createBenefitPlan(tenantId: string, dto: CreateBenefitPlanDto): Promise<BenefitPlan> {
    const plan = this.planRepository.create({ ...dto, tenantId });
    return this.planRepository.save(plan);
  }

  async getAllBenefitPlans(tenantId: string, activeOnly = true): Promise<BenefitPlan[]> {
    const where: any = { tenantId };
    if (activeOnly) where.isActive = true;
    return this.planRepository.find({ where, order: { type: 'ASC', name: 'ASC' } });
  }

  async getBenefitPlanById(tenantId: string, id: string): Promise<BenefitPlan> {
    const plan = await this.planRepository.findOne({ where: { id, tenantId } });
    if (!plan) throw new NotFoundException(`Benefit plan with ID ${id} not found`);
    return plan;
  }

  async updateBenefitPlan(tenantId: string, id: string, dto: Partial<CreateBenefitPlanDto>): Promise<BenefitPlan> {
    const plan = await this.getBenefitPlanById(tenantId, id);
    Object.assign(plan, dto);
    return this.planRepository.save(plan);
  }

  async deleteBenefitPlan(tenantId: string, id: string): Promise<void> {
    const plan = await this.getBenefitPlanById(tenantId, id);
    await this.planRepository.remove(plan);
  }

  // ==================== ENROLLMENTS ====================

  async enrollInBenefit(tenantId: string, employeeId: string, dto: EnrollBenefitDto): Promise<BenefitEnrollment> {
    // Check if plan exists
    await this.getBenefitPlanById(tenantId, dto.benefitPlanId);

    // Check for existing active enrollment
    const existing = await this.enrollmentRepository.findOne({
      where: {
        tenantId,
        employeeId,
        benefitPlanId: dto.benefitPlanId,
        status: EnrollmentStatus.ACTIVE,
      },
    });

    if (existing) {
      throw new BadRequestException('Already enrolled in this benefit plan');
    }

    const enrollment = this.enrollmentRepository.create({
      ...dto,
      tenantId,
      employeeId,
      status: EnrollmentStatus.PENDING,
    });

    return this.enrollmentRepository.save(enrollment);
  }

  async getMyEnrollments(tenantId: string, employeeId: string): Promise<BenefitEnrollment[]> {
    return this.enrollmentRepository.find({
      where: { tenantId, employeeId },
      order: { effectiveDate: 'DESC' },
    });
  }

  async getAllEnrollments(tenantId: string, filters?: { employeeId?: string; status?: EnrollmentStatus }): Promise<BenefitEnrollment[]> {
    const where: any = { tenantId };
    if (filters?.employeeId) where.employeeId = filters.employeeId;
    if (filters?.status) where.status = filters.status;

    return this.enrollmentRepository.find({ where, order: { effectiveDate: 'DESC' } });
  }

  async approveEnrollment(tenantId: string, id: string, approverId: string): Promise<BenefitEnrollment> {
    const enrollment = await this.enrollmentRepository.findOne({ where: { id, tenantId } });
    if (!enrollment) throw new NotFoundException('Enrollment not found');

    enrollment.status = EnrollmentStatus.ACTIVE;
    enrollment.approvedBy = approverId;
    enrollment.approvedAt = new Date();

    return this.enrollmentRepository.save(enrollment);
  }

  async cancelEnrollment(tenantId: string, id: string): Promise<BenefitEnrollment> {
    const enrollment = await this.enrollmentRepository.findOne({ where: { id, tenantId } });
    if (!enrollment) throw new NotFoundException('Enrollment not found');

    enrollment.status = EnrollmentStatus.CANCELLED;
    enrollment.endDate = new Date();

    return this.enrollmentRepository.save(enrollment);
  }

  // ==================== CLAIMS ====================

  async submitClaim(tenantId: string, employeeId: string, dto: SubmitClaimDto): Promise<BenefitClaim> {
    // Verify enrollment exists and is active
    const enrollment = await this.enrollmentRepository.findOne({
      where: { id: dto.enrollmentId, tenantId, employeeId, status: EnrollmentStatus.ACTIVE },
    });

    if (!enrollment) {
      throw new NotFoundException('Active enrollment not found');
    }

    const claimNumber = `CLM-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    const claim = this.claimRepository.create({
      ...dto,
      tenantId,
      employeeId,
      claimNumber,
      status: ClaimStatus.SUBMITTED,
    });

    return this.claimRepository.save(claim);
  }

  async getMyClaims(tenantId: string, employeeId: string): Promise<BenefitClaim[]> {
    return this.claimRepository.find({
      where: { tenantId, employeeId },
      order: { createdAt: 'DESC' },
    });
  }

  async getAllClaims(tenantId: string, filters?: { employeeId?: string; status?: ClaimStatus }): Promise<BenefitClaim[]> {
    const where: any = { tenantId };
    if (filters?.employeeId) where.employeeId = filters.employeeId;
    if (filters?.status) where.status = filters.status;

    return this.claimRepository.find({ where, order: { createdAt: 'DESC' } });
  }

  async reviewClaim(
    tenantId: string,
    id: string,
    reviewerId: string,
    status: ClaimStatus,
    approvedAmount?: number,
    reviewNotes?: string,
  ): Promise<BenefitClaim> {
    const claim = await this.claimRepository.findOne({ where: { id, tenantId } });
    if (!claim) throw new NotFoundException('Claim not found');

    claim.status = status;
    claim.approvedAmount = approvedAmount || null;
    claim.reviewedBy = reviewerId;
    claim.reviewNotes = reviewNotes || null;
    claim.reviewedAt = new Date();

    return this.claimRepository.save(claim);
  }

  async getClaimById(tenantId: string, id: string): Promise<BenefitClaim> {
    const claim = await this.claimRepository.findOne({ where: { id, tenantId } });
    if (!claim) throw new NotFoundException(`Claim with ID ${id} not found`);
    return claim;
  }
}
