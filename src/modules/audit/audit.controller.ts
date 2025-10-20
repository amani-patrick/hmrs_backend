import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiSecurity, ApiQuery } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { AuditService } from './audit.service';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/enums/roles.enum';
import { CreateComplianceReportDto } from './dto/create-compliance-report.dto';
import { UpdateComplianceReportDto } from './dto/update-compliance-report.dto';
import { CreateRiskAssessmentDto } from './dto/create-risk-assessment.dto';
import { UpdateRiskAssessmentDto } from './dto/update-risk-assessment.dto';
import { CreateSecurityEventDto } from './dto/create-security-event.dto';
import { CreatePolicyViolationDto } from './dto/create-policy-violation.dto';
import { ComplianceType, ComplianceStatus } from './entities/compliance-report.entity';
import { RiskLevel, RiskStatus } from './entities/risk-assessment.entity';
import { SecurityEventType, SecuritySeverity, SecurityEventStatus } from './entities/security-event.entity';
import { ViolationStatus } from './entities/policy-violation.entity';
import { AccessAction } from './entities/data-access-log.entity';

@ApiTags('Audit & Compliance')
@ApiBearerAuth()
@ApiSecurity('tenant-id')
@Controller('audit')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  // ==================== COMPLIANCE REPORTS ====================

  @Post('compliance')
  @Roles(Role.ADMIN, Role.AUDITOR, Role.HR)
  @ApiOperation({ summary: 'Create compliance report' })
  @ApiResponse({ status: 201, description: 'Report created successfully' })
  async createComplianceReport(@Req() req: any, @Body() dto: CreateComplianceReportDto) {
    const tenantId = req.tenantId;
    const userId = req.user.userId;
    return this.auditService.createComplianceReport(tenantId, userId, dto);
  }

  @Get('compliance')
  @Roles(Role.ADMIN, Role.AUDITOR, Role.HR, Role.MANAGER)
  @ApiOperation({ summary: 'Get all compliance reports' })
  @ApiQuery({ name: 'complianceType', enum: ComplianceType, required: false })
  @ApiQuery({ name: 'status', enum: ComplianceStatus, required: false })
  @ApiQuery({ name: 'departmentId', required: false })
  @ApiQuery({ name: 'startDate', required: false })
  @ApiQuery({ name: 'endDate', required: false })
  @ApiResponse({ status: 200, description: 'Reports retrieved successfully' })
  async getAllCompliance Reports(
    @Req() req: any,
    @Query('complianceType') complianceType?: ComplianceType,
    @Query('status') status?: ComplianceStatus,
    @Query('departmentId') departmentId?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.auditService.getAllComplianceReports(req.tenantId, {
      complianceType,
      status,
      departmentId,
      startDate,
      endDate,
    });
  }

  @Get('compliance/statistics')
  @Roles(Role.ADMIN, Role.AUDITOR, Role.HR)
  @ApiOperation({ summary: 'Get compliance statistics' })
  @ApiResponse({ status: 200, description: 'Statistics retrieved successfully' })
  async getComplianceStatistics(@Req() req: any) {
    return this.auditService.getComplianceStatistics(req.tenantId);
  }

  @Get('compliance/:id')
  @Roles(Role.ADMIN, Role.AUDITOR, Role.HR, Role.MANAGER)
  @ApiOperation({ summary: 'Get compliance report by ID' })
  @ApiResponse({ status: 200, description: 'Report retrieved successfully' })
  async getComplianceReportById(@Req() req: any, @Param('id') id: string) {
    return this.auditService.getComplianceReportById(req.tenantId, id);
  }

  @Put('compliance/:id')
  @Roles(Role.ADMIN, Role.AUDITOR, Role.HR)
  @ApiOperation({ summary: 'Update compliance report' })
  @ApiResponse({ status: 200, description: 'Report updated successfully' })
  async updateComplianceReport(
    @Req() req: any,
    @Param('id') id: string,
    @Body() dto: UpdateComplianceReportDto,
  ) {
    return this.auditService.updateComplianceReport(req.tenantId, id, dto);
  }

  @Delete('compliance/:id')
  @Roles(Role.ADMIN, Role.AUDITOR)
  @ApiOperation({ summary: 'Delete compliance report' })
  @ApiResponse({ status: 200, description: 'Report deleted successfully' })
  async deleteComplianceReport(@Req() req: any, @Param('id') id: string) {
    await this.auditService.deleteComplianceReport(req.tenantId, id);
    return { message: 'Compliance report deleted successfully' };
  }

  // ==================== RISK ASSESSMENTS ====================

  @Post('risks')
  @Roles(Role.ADMIN, Role.AUDITOR, Role.MANAGER)
  @ApiOperation({ summary: 'Create risk assessment' })
  @ApiResponse({ status: 201, description: 'Risk assessment created successfully' })
  async createRiskAssessment(@Req() req: any, @Body() dto: CreateRiskAssessmentDto) {
    const tenantId = req.tenantId;
    const userId = req.user.userId;
    return this.auditService.createRiskAssessment(tenantId, userId, dto);
  }

  @Get('risks')
  @Roles(Role.ADMIN, Role.AUDITOR, Role.MANAGER)
  @ApiOperation({ summary: 'Get all risk assessments' })
  @ApiQuery({ name: 'riskLevel', enum: RiskLevel, required: false })
  @ApiQuery({ name: 'status', enum: RiskStatus, required: false })
  @ApiQuery({ name: 'category', required: false })
  @ApiQuery({ name: 'departmentId', required: false })
  @ApiResponse({ status: 200, description: 'Risk assessments retrieved successfully' })
  async getAllRiskAssessments(
    @Req() req: any,
    @Query('riskLevel') riskLevel?: RiskLevel,
    @Query('status') status?: RiskStatus,
    @Query('category') category?: string,
    @Query('departmentId') departmentId?: string,
  ) {
    return this.auditService.getAllRiskAssessments(req.tenantId, {
      riskLevel,
      status,
      category,
      departmentId,
    });
  }

  @Get('risks/statistics')
  @Roles(Role.ADMIN, Role.AUDITOR)
  @ApiOperation({ summary: 'Get risk statistics' })
  @ApiResponse({ status: 200, description: 'Statistics retrieved successfully' })
  async getRiskStatistics(@Req() req: any) {
    return this.auditService.getRiskStatistics(req.tenantId);
  }

  @Get('risks/:id')
  @Roles(Role.ADMIN, Role.AUDITOR, Role.MANAGER)
  @ApiOperation({ summary: 'Get risk assessment by ID' })
  @ApiResponse({ status: 200, description: 'Risk assessment retrieved successfully' })
  async getRiskAssessmentById(@Req() req: any, @Param('id') id: string) {
    return this.auditService.getRiskAssessmentById(req.tenantId, id);
  }

  @Put('risks/:id')
  @Roles(Role.ADMIN, Role.AUDITOR, Role.MANAGER)
  @ApiOperation({ summary: 'Update risk assessment' })
  @ApiResponse({ status: 200, description: 'Risk assessment updated successfully' })
  async updateRiskAssessment(
    @Req() req: any,
    @Param('id') id: string,
    @Body() dto: UpdateRiskAssessmentDto,
  ) {
    return this.auditService.updateRiskAssessment(req.tenantId, id, dto);
  }

  @Delete('risks/:id')
  @Roles(Role.ADMIN, Role.AUDITOR)
  @ApiOperation({ summary: 'Delete risk assessment' })
  @ApiResponse({ status: 200, description: 'Risk assessment deleted successfully' })
  async deleteRiskAssessment(@Req() req: any, @Param('id') id: string) {
    await this.auditService.deleteRiskAssessment(req.tenantId, id);
    return { message: 'Risk assessment deleted successfully' };
  }

  // ==================== SECURITY EVENTS ====================

  @Post('security-events')
  @Roles(Role.ADMIN, Role.AUDITOR)
  @ApiOperation({ summary: 'Create security event' })
  @ApiResponse({ status: 201, description: 'Security event created successfully' })
  async createSecurityEvent(@Req() req: any, @Body() dto: CreateSecurityEventDto) {
    return this.auditService.createSecurityEvent(req.tenantId, dto);
  }

  @Get('security-events')
  @Roles(Role.ADMIN, Role.AUDITOR)
  @ApiOperation({ summary: 'Get all security events' })
  @ApiQuery({ name: 'eventType', enum: SecurityEventType, required: false })
  @ApiQuery({ name: 'severity', enum: SecuritySeverity, required: false })
  @ApiQuery({ name: 'status', enum: SecurityEventStatus, required: false })
  @ApiQuery({ name: 'userId', required: false })
  @ApiQuery({ name: 'startDate', required: false })
  @ApiQuery({ name: 'endDate', required: false })
  @ApiResponse({ status: 200, description: 'Security events retrieved successfully' })
  async getAllSecurityEvents(
    @Req() req: any,
    @Query('eventType') eventType?: SecurityEventType,
    @Query('severity') severity?: SecuritySeverity,
    @Query('status') status?: SecurityEventStatus,
    @Query('userId') userId?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.auditService.getAllSecurityEvents(req.tenantId, {
      eventType,
      severity,
      status,
      userId,
      startDate,
      endDate,
    });
  }

  @Get('security-events/statistics')
  @Roles(Role.ADMIN, Role.AUDITOR)
  @ApiOperation({ summary: 'Get security statistics' })
  @ApiResponse({ status: 200, description: 'Statistics retrieved successfully' })
  async getSecurityStatistics(@Req() req: any) {
    return this.auditService.getSecurityStatistics(req.tenantId);
  }

  @Get('security-events/:id')
  @Roles(Role.ADMIN, Role.AUDITOR)
  @ApiOperation({ summary: 'Get security event by ID' })
  @ApiResponse({ status: 200, description: 'Security event retrieved successfully' })
  async getSecurityEventById(@Req() req: any, @Param('id') id: string) {
    return this.auditService.getSecurityEventById(req.tenantId, id);
  }

  @Post('security-events/:id/resolve')
  @Roles(Role.ADMIN, Role.AUDITOR)
  @ApiOperation({ summary: 'Resolve security event' })
  @ApiResponse({ status: 200, description: 'Security event resolved successfully' })
  async resolveSecurityEvent(
    @Req() req: any,
    @Param('id') id: string,
    @Body('resolution') resolution: string,
  ) {
    const userId = req.user.userId;
    return this.auditService.resolveSecurityEvent(req.tenantId, id, resolution, userId);
  }

  // ==================== DATA ACCESS LOGS ====================

  @Get('data-access-logs')
  @Roles(Role.ADMIN, Role.AUDITOR)
  @ApiOperation({ summary: 'Get data access logs' })
  @ApiQuery({ name: 'userId', required: false })
  @ApiQuery({ name: 'entityType', required: false })
  @ApiQuery({ name: 'action', enum: AccessAction, required: false })
  @ApiQuery({ name: 'startDate', required: false })
  @ApiQuery({ name: 'endDate', required: false })
  @ApiResponse({ status: 200, description: 'Data access logs retrieved successfully' })
  async getDataAccessLogs(
    @Req() req: any,
    @Query('userId') userId?: string,
    @Query('entityType') entityType?: string,
    @Query('action') action?: AccessAction,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.auditService.getDataAccessLogs(req.tenantId, {
      userId,
      entityType,
      action,
      startDate,
      endDate,
    });
  }

  // ==================== POLICY VIOLATIONS ====================

  @Post('violations')
  @Roles(Role.ADMIN, Role.AUDITOR, Role.HR, Role.MANAGER)
  @ApiOperation({ summary: 'Create policy violation report' })
  @ApiResponse({ status: 201, description: 'Violation reported successfully' })
  async createPolicyViolation(@Req() req: any, @Body() dto: CreatePolicyViolationDto) {
    return this.auditService.createPolicyViolation(req.tenantId, dto);
  }

  @Get('violations')
  @Roles(Role.ADMIN, Role.AUDITOR, Role.HR, Role.MANAGER)
  @ApiOperation({ summary: 'Get all policy violations' })
  @ApiQuery({ name: 'employeeId', required: false })
  @ApiQuery({ name: 'status', enum: ViolationStatus, required: false })
  @ApiQuery({ name: 'severity', required: false })
  @ApiQuery({ name: 'startDate', required: false })
  @ApiQuery({ name: 'endDate', required: false })
  @ApiResponse({ status: 200, description: 'Violations retrieved successfully' })
  async getAllPolicyViolations(
    @Req() req: any,
    @Query('employeeId') employeeId?: string,
    @Query('status') status?: ViolationStatus,
    @Query('severity') severity?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.auditService.getAllPolicyViolations(req.tenantId, {
      employeeId,
      status,
      severity,
      startDate,
      endDate,
    });
  }

  @Get('violations/:id')
  @Roles(Role.ADMIN, Role.AUDITOR, Role.HR, Role.MANAGER)
  @ApiOperation({ summary: 'Get policy violation by ID' })
  @ApiResponse({ status: 200, description: 'Violation retrieved successfully' })
  async getPolicyViolationById(@Req() req: any, @Param('id') id: string) {
    return this.auditService.getPolicyViolationById(req.tenantId, id);
  }

  @Put('violations/:id/status')
  @Roles(Role.ADMIN, Role.AUDITOR, Role.HR)
  @ApiOperation({ summary: 'Update violation status' })
  @ApiResponse({ status: 200, description: 'Status updated successfully' })
  async updateViolationStatus(
    @Req() req: any,
    @Param('id') id: string,
    @Body('status') status: ViolationStatus,
    @Body('investigation') investigation?: string,
    @Body('action') action?: string,
  ) {
    return this.auditService.updateViolationStatus(req.tenantId, id, status, investigation, action);
  }

  // ==================== AUDIT LOGS ====================

  @Get('logs')
  @Roles(Role.ADMIN, Role.AUDITOR)
  @ApiOperation({ summary: 'Get audit logs' })
  @ApiQuery({ name: 'userId', required: false })
  @ApiQuery({ name: 'action', required: false })
  @ApiQuery({ name: 'entityType', required: false })
  @ApiQuery({ name: 'startDate', required: false })
  @ApiQuery({ name: 'endDate', required: false })
  @ApiResponse({ status: 200, description: 'Audit logs retrieved successfully' })
  async getAuditLogs(
    @Req() req: any,
    @Query('userId') userId?: string,
    @Query('action') action?: string,
    @Query('entityType') entityType?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.auditService.getAuditLogs(req.tenantId, {
      userId,
      action,
      entityType,
      startDate,
      endDate,
    });
  }

  // ==================== DASHBOARD ====================

  @Get('dashboard')
  @Roles(Role.ADMIN, Role.AUDITOR)
  @ApiOperation({ summary: 'Get audit dashboard' })
  @ApiResponse({ status: 200, description: 'Dashboard retrieved successfully' })
  async getAuditDashboard(@Req() req: any) {
    return this.auditService.getAuditDashboard(req.tenantId);
  }
}
