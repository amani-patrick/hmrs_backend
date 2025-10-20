import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiSecurity, ApiQuery } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { BenefitsService } from './benefits.service';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/enums/roles.enum';
import { CreateBenefitPlanDto } from './dto/create-benefit-plan.dto';
import { EnrollBenefitDto } from './dto/enroll-benefit.dto';
import { SubmitClaimDto } from './dto/submit-claim.dto';
import { EnrollmentStatus } from './entities/benefit-enrollment.entity';
import { ClaimStatus } from './entities/benefit-claim.entity';

@ApiTags('Benefits Management')
@ApiBearerAuth()
@ApiSecurity('tenant-id')
@Controller('benefits')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class BenefitsController {
  constructor(private readonly benefitsService: BenefitsService) {}

  // ==================== BENEFIT PLANS ====================

  @Post('plans')
  @Roles(Role.HR, Role.ADMIN)
  @ApiOperation({ summary: 'Create benefit plan' })
  @ApiResponse({ status: 201, description: 'Plan created successfully' })
  async createBenefitPlan(@Req() req: any, @Body() dto: CreateBenefitPlanDto) {
    return this.benefitsService.createBenefitPlan(req.tenantId, dto);
  }

  @Get('plans')
  @ApiOperation({ summary: 'Get all benefit plans' })
  @ApiQuery({ name: 'activeOnly', type: Boolean, required: false })
  @ApiResponse({ status: 200, description: 'Plans retrieved successfully' })
  async getAllBenefitPlans(@Req() req: any, @Query('activeOnly') activeOnly?: boolean) {
    return this.benefitsService.getAllBenefitPlans(req.tenantId, activeOnly !== false);
  }

  @Get('plans/:id')
  @ApiOperation({ summary: 'Get benefit plan by ID' })
  @ApiResponse({ status: 200, description: 'Plan retrieved successfully' })
  async getBenefitPlanById(@Req() req: any, @Param('id') id: string) {
    return this.benefitsService.getBenefitPlanById(req.tenantId, id);
  }

  @Put('plans/:id')
  @Roles(Role.HR, Role.ADMIN)
  @ApiOperation({ summary: 'Update benefit plan' })
  @ApiResponse({ status: 200, description: 'Plan updated successfully' })
  async updateBenefitPlan(@Req() req: any, @Param('id') id: string, @Body() dto: Partial<CreateBenefitPlanDto>) {
    return this.benefitsService.updateBenefitPlan(req.tenantId, id, dto);
  }

  @Delete('plans/:id')
  @Roles(Role.HR, Role.ADMIN)
  @ApiOperation({ summary: 'Delete benefit plan' })
  @ApiResponse({ status: 200, description: 'Plan deleted successfully' })
  async deleteBenefitPlan(@Req() req: any, @Param('id') id: string) {
    await this.benefitsService.deleteBenefitPlan(req.tenantId, id);
    return { message: 'Benefit plan deleted successfully' };
  }

  // ==================== ENROLLMENTS ====================

  @Post('enrollments')
  @ApiOperation({ summary: 'Enroll in benefit' })
  @ApiResponse({ status: 201, description: 'Enrolled successfully' })
  async enrollInBenefit(@Req() req: any, @Body() dto: EnrollBenefitDto) {
    return this.benefitsService.enrollInBenefit(req.tenantId, req.user.userId, dto);
  }

  @Get('enrollments/my')
  @ApiOperation({ summary: 'Get my enrollments' })
  @ApiResponse({ status: 200, description: 'Enrollments retrieved successfully' })
  async getMyEnrollments(@Req() req: any) {
    return this.benefitsService.getMyEnrollments(req.tenantId, req.user.userId);
  }

  @Get('enrollments')
  @Roles(Role.HR, Role.ADMIN)
  @ApiOperation({ summary: 'Get all enrollments' })
  @ApiQuery({ name: 'employeeId', required: false })
  @ApiQuery({ name: 'status', enum: EnrollmentStatus, required: false })
  @ApiResponse({ status: 200, description: 'Enrollments retrieved successfully' })
  async getAllEnrollments(
    @Req() req: any,
    @Query('employeeId') employeeId?: string,
    @Query('status') status?: EnrollmentStatus,
  ) {
    return this.benefitsService.getAllEnrollments(req.tenantId, { employeeId, status });
  }

  @Post('enrollments/:id/approve')
  @Roles(Role.HR, Role.ADMIN)
  @ApiOperation({ summary: 'Approve enrollment' })
  @ApiResponse({ status: 200, description: 'Enrollment approved' })
  async approveEnrollment(@Req() req: any, @Param('id') id: string) {
    return this.benefitsService.approveEnrollment(req.tenantId, id, req.user.userId);
  }

  @Post('enrollments/:id/cancel')
  @ApiOperation({ summary: 'Cancel enrollment' })
  @ApiResponse({ status: 200, description: 'Enrollment cancelled' })
  async cancelEnrollment(@Req() req: any, @Param('id') id: string) {
    return this.benefitsService.cancelEnrollment(req.tenantId, id);
  }

  // ==================== CLAIMS ====================

  @Post('claims')
  @ApiOperation({ summary: 'Submit benefit claim' })
  @ApiResponse({ status: 201, description: 'Claim submitted successfully' })
  async submitClaim(@Req() req: any, @Body() dto: SubmitClaimDto) {
    return this.benefitsService.submitClaim(req.tenantId, req.user.userId, dto);
  }

  @Get('claims/my')
  @ApiOperation({ summary: 'Get my claims' })
  @ApiResponse({ status: 200, description: 'Claims retrieved successfully' })
  async getMyClaims(@Req() req: any) {
    return this.benefitsService.getMyClaims(req.tenantId, req.user.userId);
  }

  @Get('claims')
  @Roles(Role.HR, Role.ADMIN)
  @ApiOperation({ summary: 'Get all claims' })
  @ApiQuery({ name: 'employeeId', required: false })
  @ApiQuery({ name: 'status', enum: ClaimStatus, required: false })
  @ApiResponse({ status: 200, description: 'Claims retrieved successfully' })
  async getAllClaims(
    @Req() req: any,
    @Query('employeeId') employeeId?: string,
    @Query('status') status?: ClaimStatus,
  ) {
    return this.benefitsService.getAllClaims(req.tenantId, { employeeId, status });
  }

  @Post('claims/:id/review')
  @Roles(Role.HR, Role.ADMIN)
  @ApiOperation({ summary: 'Review claim' })
  @ApiResponse({ status: 200, description: 'Claim reviewed' })
  async reviewClaim(
    @Req() req: any,
    @Param('id') id: string,
    @Body() body: { status: ClaimStatus; approvedAmount?: number; reviewNotes?: string },
  ) {
    return this.benefitsService.reviewClaim(
      req.tenantId,
      id,
      req.user.userId,
      body.status,
      body.approvedAmount,
      body.reviewNotes,
    );
  }

  @Get('claims/:id')
  @ApiOperation({ summary: 'Get claim by ID' })
  @ApiResponse({ status: 200, description: 'Claim retrieved successfully' })
  async getClaimById(@Req() req: any, @Param('id') id: string) {
    return this.benefitsService.getClaimById(req.tenantId, id);
  }
}
