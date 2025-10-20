import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { Repository, Between, MoreThan, LessThan, In } from 'typeorm';
import { ComplianceReport, ComplianceStatus, ComplianceType } from './entities/compliance-report.entity';
import { RiskAssessment, RiskLevel, RiskStatus } from './entities/risk-assessment.entity';
import { SecurityEvent, SecuritySeverity, SecurityEventType, SecurityEventStatus } from './entities/security-event.entity';
import { DataAccessLog, AccessAction } from './entities/data-access-log.entity';
import { PolicyViolation, ViolationStatus } from './entities/policy-violation.entity';
import { AuditLog } from '../../common/entities/audit-log.entity';
import { CreateComplianceReportDto } from './dto/create-compliance-report.dto';
import { UpdateComplianceReportDto } from './dto/update-compliance-report.dto';
import { CreateRiskAssessmentDto } from './dto/create-risk-assessment.dto';
import { UpdateRiskAssessmentDto } from './dto/update-risk-assessment.dto';
import { CreateSecurityEventDto } from './dto/create-security-event.dto';
import { CreatePolicyViolationDto } from './dto/create-policy-violation.dto';

@Injectable()
export class AuditService {
  constructor(
    @Inject('COMPLIANCE_REPORT_REPOSITORY')
    private readonly complianceRepository: Repository<ComplianceReport>,
    @Inject('RISK_ASSESSMENT_REPOSITORY')
    private readonly riskRepository: Repository<RiskAssessment>,
    @Inject('SECURITY_EVENT_REPOSITORY')
    private readonly securityEventRepository: Repository<SecurityEvent>,
    @Inject('DATA_ACCESS_LOG_REPOSITORY')
    private readonly dataAccessLogRepository: Repository<DataAccessLog>,
    @Inject('POLICY_VIOLATION_REPOSITORY')
    private readonly violationRepository: Repository<PolicyViolation>,
    @Inject('AUDIT_LOG_REPOSITORY')
    private readonly auditLogRepository: Repository<AuditLog>,
  ) {}

  // ==================== COMPLIANCE REPORTS ====================

  async createComplianceReport(tenantId: string, userId: string, dto: CreateComplianceReportDto): Promise<ComplianceReport> {
    const report = this.complianceRepository.create({
      ...dto,
      tenantId,
      createdBy: userId,
    });

    return this.complianceRepository.save(report);
  }

  async getAllComplianceReports(tenantId: string, filters?: {
    complianceType?: ComplianceType;
    status?: ComplianceStatus;
    departmentId?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<ComplianceReport[]> {
    const where: any = { tenantId };

    if (filters?.complianceType) where.complianceType = filters.complianceType;
    if (filters?.status) where.status = filters.status;
    if (filters?.departmentId) where.departmentId = filters.departmentId;

    if (filters?.startDate && filters?.endDate) {
      where.reportDate = Between(new Date(filters.startDate), new Date(filters.endDate));
    }

    return this.complianceRepository.find({
      where,
      order: { reportDate: 'DESC' },
    });
  }

  async getComplianceReportById(tenantId: string, id: string): Promise<ComplianceReport> {
    const report = await this.complianceRepository.findOne({
      where: { id, tenantId },
    });

    if (!report) {
      throw new NotFoundException(`Compliance report with ID ${id} not found`);
    }

    return report;
  }

  async updateComplianceReport(tenantId: string, id: string, dto: UpdateComplianceReportDto): Promise<ComplianceReport> {
    const report = await this.getComplianceReportById(tenantId, id);
    Object.assign(report, dto);
    return this.complianceRepository.save(report);
  }

  async deleteComplianceReport(tenantId: string, id: string): Promise<void> {
    const report = await this.getComplianceReportById(tenantId, id);
    await this.complianceRepository.remove(report);
  }

  async getComplianceStatistics(tenantId: string): Promise<{
    totalReports: number;
    compliant: number;
    nonCompliant: number;
    partial: number;
    averageScore: number;
    reportsByType: Record<string, number>;
  }> {
    const reports = await this.complianceRepository.find({ where: { tenantId } });

    const totalReports = reports.length;
    const compliant = reports.filter(r => r.status === ComplianceStatus.COMPLIANT).length;
    const nonCompliant = reports.filter(r => r.status === ComplianceStatus.NON_COMPLIANT).length;
    const partial = reports.filter(r => r.status === ComplianceStatus.PARTIAL).length;

    const scoresWithValue = reports.filter(r => r.complianceScore !== null);
    const averageScore = scoresWithValue.length > 0
      ? scoresWithValue.reduce((sum, r) => sum + Number(r.complianceScore), 0) / scoresWithValue.length
      : 0;

    const reportsByType: Record<string, number> = {};
    reports.forEach(r => {
      reportsByType[r.complianceType] = (reportsByType[r.complianceType] || 0) + 1;
    });

    return {
      totalReports,
      compliant,
      nonCompliant,
      partial,
      averageScore: Math.round(averageScore * 100) / 100,
      reportsByType,
    };
  }

  // ==================== RISK ASSESSMENTS ====================

  async createRiskAssessment(tenantId: string, userId: string, dto: CreateRiskAssessmentDto): Promise<RiskAssessment> {
    const riskScore = dto.likelihood * dto.impact;

    const risk = this.riskRepository.create({
      ...dto,
      tenantId,
      createdBy: userId,
      riskScore,
      status: RiskStatus.IDENTIFIED,
    });

    return this.riskRepository.save(risk);
  }

  async getAllRiskAssessments(tenantId: string, filters?: {
    riskLevel?: RiskLevel;
    status?: RiskStatus;
    category?: string;
    departmentId?: string;
  }): Promise<RiskAssessment[]> {
    const where: any = { tenantId };

    if (filters?.riskLevel) where.riskLevel = filters.riskLevel;
    if (filters?.status) where.status = filters.status;
    if (filters?.category) where.category = filters.category;
    if (filters?.departmentId) where.departmentId = filters.departmentId;

    return this.riskRepository.find({
      where,
      order: { riskScore: 'DESC' },
    });
  }

  async getRiskAssessmentById(tenantId: string, id: string): Promise<RiskAssessment> {
    const risk = await this.riskRepository.findOne({
      where: { id, tenantId },
    });

    if (!risk) {
      throw new NotFoundException(`Risk assessment with ID ${id} not found`);
    }

    return risk;
  }

  async updateRiskAssessment(tenantId: string, id: string, dto: UpdateRiskAssessmentDto): Promise<RiskAssessment> {
    const risk = await this.getRiskAssessmentById(tenantId, id);
    
    Object.assign(risk, dto);

    // Recalculate risk score if likelihood or impact changed
    if (dto.likelihood || dto.impact) {
      risk.riskScore = (dto.likelihood || risk.likelihood) * (dto.impact || risk.impact);
    }

    // Calculate residual risk score
    if (dto.residualLikelihood && dto.residualImpact) {
      risk.residualRiskScore = dto.residualLikelihood * dto.residualImpact;
    }

    return this.riskRepository.save(risk);
  }

  async deleteRiskAssessment(tenantId: string, id: string): Promise<void> {
    const risk = await this.getRiskAssessmentById(tenantId, id);
    await this.riskRepository.remove(risk);
  }

  async getRiskStatistics(tenantId: string): Promise<{
    totalRisks: number;
    byLevel: Record<string, number>;
    byStatus: Record<string, number>;
    averageRiskScore: number;
    highRiskCount: number;
  }> {
    const risks = await this.riskRepository.find({ where: { tenantId } });

    const totalRisks = risks.length;
    const byLevel: Record<string, number> = {};
    const byStatus: Record<string, number> = {};

    risks.forEach(r => {
      byLevel[r.riskLevel] = (byLevel[r.riskLevel] || 0) + 1;
      byStatus[r.status] = (byStatus[r.status] || 0) + 1;
    });

    const averageRiskScore = totalRisks > 0
      ? risks.reduce((sum, r) => sum + r.riskScore, 0) / totalRisks
      : 0;

    const highRiskCount = risks.filter(r => 
      r.riskLevel === RiskLevel.HIGH || r.riskLevel === RiskLevel.CRITICAL
    ).length;

    return {
      totalRisks,
      byLevel,
      byStatus,
      averageRiskScore: Math.round(averageRiskScore * 100) / 100,
      highRiskCount,
    };
  }

  // ==================== SECURITY EVENTS ====================

  async createSecurityEvent(tenantId: string, dto: CreateSecurityEventDto): Promise<SecurityEvent> {
    const event = this.securityEventRepository.create({
      ...dto,
      tenantId,
      status: SecurityEventStatus.NEW,
    });

    return this.securityEventRepository.save(event);
  }

  async getAllSecurityEvents(tenantId: string, filters?: {
    eventType?: SecurityEventType;
    severity?: SecuritySeverity;
    status?: SecurityEventStatus;
    userId?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<SecurityEvent[]> {
    const where: any = { tenantId };

    if (filters?.eventType) where.eventType = filters.eventType;
    if (filters?.severity) where.severity = filters.severity;
    if (filters?.status) where.status = filters.status;
    if (filters?.userId) where.userId = filters.userId;

    if (filters?.startDate && filters?.endDate) {
      where.occurredAt = Between(new Date(filters.startDate), new Date(filters.endDate));
    }

    return this.securityEventRepository.find({
      where,
      order: { occurredAt: 'DESC' },
    });
  }

  async getSecurityEventById(tenantId: string, id: string): Promise<SecurityEvent> {
    const event = await this.securityEventRepository.findOne({
      where: { id, tenantId },
    });

    if (!event) {
      throw new NotFoundException(`Security event with ID ${id} not found`);
    }

    return event;
  }

  async resolveSecurityEvent(tenantId: string, id: string, resolution: string, userId: string): Promise<SecurityEvent> {
    const event = await this.getSecurityEventById(tenantId, id);

    event.status = SecurityEventStatus.RESOLVED;
    event.resolution = resolution;
    event.resolvedAt = new Date();
    event.assignedTo = userId;

    return this.securityEventRepository.save(event);
  }

  async getSecurityStatistics(tenantId: string): Promise<{
    totalEvents: number;
    bySeverity: Record<string, number>;
    byStatus: Record<string, number>;
    recentEvents: number;
    criticalOpen: number;
  }> {
    const events = await this.securityEventRepository.find({ where: { tenantId } });

    const totalEvents = events.length;
    const bySeverity: Record<string, number> = {};
    const byStatus: Record<string, number> = {};

    events.forEach(e => {
      bySeverity[e.severity] = (bySeverity[e.severity] || 0) + 1;
      byStatus[e.status] = (byStatus[e.status] || 0) + 1;
    });

    const oneDayAgo = new Date();
    oneDayAgo.setDate(oneDayAgo.getDate() - 1);
    const recentEvents = events.filter(e => new Date(e.occurredAt) > oneDayAgo).length;

    const criticalOpen = events.filter(e => 
      e.severity === SecuritySeverity.CRITICAL && e.status !== SecurityEventStatus.RESOLVED
    ).length;

    return {
      totalEvents,
      bySeverity,
      byStatus,
      recentEvents,
      criticalOpen,
    };
  }

  // ==================== DATA ACCESS LOGS ====================

  async logDataAccess(tenantId: string, data: {
    userId: string;
    userName: string;
    action: AccessAction;
    entityType: string;
    entityId: string;
    entityDescription?: string;
    accessedFields?: string[];
    purpose?: string;
    ipAddress?: string;
    userAgent?: string;
    isAuthorized?: boolean;
  }): Promise<DataAccessLog> {
    const log = this.dataAccessLogRepository.create({
      ...data,
      tenantId,
      accessedAt: new Date(),
      isAuthorized: data.isAuthorized ?? true,
    });

    return this.dataAccessLogRepository.save(log);
  }

  async getDataAccessLogs(tenantId: string, filters?: {
    userId?: string;
    entityType?: string;
    action?: AccessAction;
    startDate?: string;
    endDate?: string;
  }): Promise<DataAccessLog[]> {
    const where: any = { tenantId };

    if (filters?.userId) where.userId = filters.userId;
    if (filters?.entityType) where.entityType = filters.entityType;
    if (filters?.action) where.action = filters.action;

    if (filters?.startDate && filters?.endDate) {
      where.accessedAt = Between(new Date(filters.startDate), new Date(filters.endDate));
    }

    return this.dataAccessLogRepository.find({
      where,
      order: { accessedAt: 'DESC' },
      take: 1000, // Limit for performance
    });
  }

  // ==================== POLICY VIOLATIONS ====================

  async createPolicyViolation(tenantId: string, dto: CreatePolicyViolationDto): Promise<PolicyViolation> {
    const violation = this.violationRepository.create({
      ...dto,
      tenantId,
      status: ViolationStatus.REPORTED,
    });

    return this.violationRepository.save(violation);
  }

  async getAllPolicyViolations(tenantId: string, filters?: {
    employeeId?: string;
    status?: ViolationStatus;
    severity?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<PolicyViolation[]> {
    const where: any = { tenantId };

    if (filters?.employeeId) where.employeeId = filters.employeeId;
    if (filters?.status) where.status = filters.status;
    if (filters?.severity) where.severity = filters.severity;

    if (filters?.startDate && filters?.endDate) {
      where.incidentDate = Between(new Date(filters.startDate), new Date(filters.endDate));
    }

    return this.violationRepository.find({
      where,
      order: { incidentDate: 'DESC' },
    });
  }

  async getPolicyViolationById(tenantId: string, id: string): Promise<PolicyViolation> {
    const violation = await this.violationRepository.findOne({
      where: { id, tenantId },
    });

    if (!violation) {
      throw new NotFoundException(`Policy violation with ID ${id} not found`);
    }

    return violation;
  }

  async updateViolationStatus(
    tenantId: string,
    id: string,
    status: ViolationStatus,
    investigation?: string,
    action?: string,
  ): Promise<PolicyViolation> {
    const violation = await this.getPolicyViolationById(tenantId, id);

    violation.status = status;
    if (investigation) violation.investigation = investigation;
    if (action) violation.action = action;

    if (status === ViolationStatus.RESOLVED) {
      violation.resolvedAt = new Date();
    }

    return this.violationRepository.save(violation);
  }

  // ==================== AUDIT LOGS (from common) ====================

  async getAuditLogs(tenantId: string, filters?: {
    userId?: string;
    action?: string;
    entityType?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<AuditLog[]> {
    const where: any = { tenantId };

    if (filters?.userId) where.userId = filters.userId;
    if (filters?.action) where.action = filters.action;
    if (filters?.entityType) where.entityType = filters.entityType;

    if (filters?.startDate && filters?.endDate) {
      where.createdAt = Between(new Date(filters.startDate), new Date(filters.endDate));
    }

    return this.auditLogRepository.find({
      where,
      order: { createdAt: 'DESC' },
      take: 1000,
    });
  }

  // ==================== DASHBOARD ====================

  async getAuditDashboard(tenantId: string): Promise<{
    compliance: { total: number; compliant: number; nonCompliant: number };
    risks: { total: number; high: number; medium: number; low: number };
    securityEvents: { total: number; critical: number; resolved: number };
    violations: { total: number; open: number; resolved: number };
    recentActivity: Array<{ type: string; description: string; timestamp: Date }>;
  }> {
    const [complianceReports, risks, securityEvents, violations] = await Promise.all([
      this.complianceRepository.find({ where: { tenantId } }),
      this.riskRepository.find({ where: { tenantId } }),
      this.securityEventRepository.find({ where: { tenantId } }),
      this.violationRepository.find({ where: { tenantId } }),
    ]);

    const compliance = {
      total: complianceReports.length,
      compliant: complianceReports.filter(r => r.status === ComplianceStatus.COMPLIANT).length,
      nonCompliant: complianceReports.filter(r => r.status === ComplianceStatus.NON_COMPLIANT).length,
    };

    const riskStats = {
      total: risks.length,
      high: risks.filter(r => r.riskLevel === RiskLevel.HIGH || r.riskLevel === RiskLevel.CRITICAL).length,
      medium: risks.filter(r => r.riskLevel === RiskLevel.MEDIUM).length,
      low: risks.filter(r => r.riskLevel === RiskLevel.LOW).length,
    };

    const securityStats = {
      total: securityEvents.length,
      critical: securityEvents.filter(e => e.severity === SecuritySeverity.CRITICAL).length,
      resolved: securityEvents.filter(e => e.status === SecurityEventStatus.RESOLVED).length,
    };

    const violationStats = {
      total: violations.length,
      open: violations.filter(v => v.status === ViolationStatus.REPORTED || v.status === ViolationStatus.INVESTIGATING).length,
      resolved: violations.filter(v => v.status === ViolationStatus.RESOLVED).length,
    };

    // Get recent activity from multiple sources
    const recentActivity: Array<{ type: string; description: string; timestamp: Date }> = [];

    securityEvents.slice(0, 5).forEach(e => {
      recentActivity.push({
        type: 'security',
        description: `Security event: ${e.description}`,
        timestamp: new Date(e.occurredAt),
      });
    });

    violations.slice(0, 5).forEach(v => {
      recentActivity.push({
        type: 'violation',
        description: `Policy violation reported`,
        timestamp: v.createdAt,
      });
    });

    return {
      compliance,
      risks: riskStats,
      securityEvents: securityStats,
      violations: violationStats,
      recentActivity: recentActivity.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()).slice(0, 10),
    };
  }
}
