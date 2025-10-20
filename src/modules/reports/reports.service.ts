import { Injectable, Inject, NotFoundException, BadRequestException } from '@nestjs/common';
import { Repository, In, Between } from 'typeorm';
import { ReportTemplate, ReportType, ReportCategory, ReportFormat } from './entities/report-template.entity';
import { GeneratedReport, ReportStatus } from './entities/generated-report.entity';
import { ScheduledReport, ScheduleFrequency, ScheduleStatus } from './entities/scheduled-report.entity';
import { CreateReportTemplateDto } from './dto/create-report-template.dto';
import { UpdateReportTemplateDto } from './dto/update-report-template.dto';
import { GenerateReportDto } from './dto/generate-report.dto';
import { CreateScheduledReportDto } from './dto/create-scheduled-report.dto';
import { UpdateScheduledReportDto } from './dto/update-scheduled-report.dto';

@Injectable()
export class ReportsService {
  constructor(
    @Inject('REPORT_TEMPLATE_REPOSITORY')
    private readonly templateRepository: Repository<ReportTemplate>,
    @Inject('GENERATED_REPORT_REPOSITORY')
    private readonly generatedReportRepository: Repository<GeneratedReport>,
    @Inject('SCHEDULED_REPORT_REPOSITORY')
    private readonly scheduledReportRepository: Repository<ScheduledReport>,
  ) {}

  // ==================== TEMPLATES ====================

  async createTemplate(tenantId: string, userId: string, dto: CreateReportTemplateDto): Promise<ReportTemplate> {
    const template = this.templateRepository.create({
      ...dto,
      tenantId,
      createdBy: userId,
      isSystem: false,
    });

    return this.templateRepository.save(template);
  }

  async getAllTemplates(tenantId: string, filters?: {
    type?: ReportType;
    category?: ReportCategory;
    isActive?: boolean;
  }): Promise<ReportTemplate[]> {
    const where: any = { tenantId };

    if (filters?.type) where.type = filters.type;
    if (filters?.category) where.category = filters.category;
    if (filters?.isActive !== undefined) where.isActive = filters.isActive;

    return this.templateRepository.find({
      where,
      order: { name: 'ASC' },
    });
  }

  async getTemplateById(tenantId: string, id: string): Promise<ReportTemplate> {
    const template = await this.templateRepository.findOne({
      where: { id, tenantId },
    });

    if (!template) {
      throw new NotFoundException(`Report template with ID ${id} not found`);
    }

    return template;
  }

  async updateTemplate(tenantId: string, id: string, dto: UpdateReportTemplateDto): Promise<ReportTemplate> {
    const template = await this.getTemplateById(tenantId, id);

    if (template.isSystem) {
      throw new BadRequestException('Cannot modify system templates');
    }

    Object.assign(template, dto);
    return this.templateRepository.save(template);
  }

  async deleteTemplate(tenantId: string, id: string): Promise<void> {
    const template = await this.getTemplateById(tenantId, id);

    if (template.isSystem) {
      throw new BadRequestException('Cannot delete system templates');
    }

    await this.templateRepository.remove(template);
  }

  // ==================== GENERATE REPORTS ====================

  async generateReport(tenantId: string, userId: string, userFullName: string, dto: GenerateReportDto): Promise<GeneratedReport> {
    const template = await this.getTemplateById(tenantId, dto.templateId);

    const reportName = dto.name || template.name;
    const reportFormat = dto.format || template.defaultFormat;

    const report = this.generatedReportRepository.create({
      tenantId,
      templateId: dto.templateId,
      name: reportName,
      description: dto.description,
      status: ReportStatus.PENDING,
      format: reportFormat,
      parameters: dto.parameters,
      filters: dto.filters,
      generatedBy: userId,
      generatedByName: userFullName,
      expiresAt: this.calculateExpiryDate(30), // 30 days from now
    });

    const savedReport = await this.generatedReportRepository.save(report);

    // Trigger async report generation (would integrate with queue system)
    this.processReportGeneration(savedReport.id, template).catch(err => {
      console.error('Report generation error:', err);
    });

    return savedReport;
  }

  private async processReportGeneration(reportId: string, template: ReportTemplate): Promise<void> {
    try {
      const report = await this.generatedReportRepository.findOne({ where: { id: reportId } });
      if (!report) return;

      report.status = ReportStatus.PROCESSING;
      await this.generatedReportRepository.save(report);

      // Simulate report generation (in real app, this would query data and generate file)
      await this.delay(2000); // Simulate processing time

      // Mock report generation
      const mockData = await this.fetchReportData(template, report.filters);
      
      report.status = ReportStatus.READY;
      report.fileUrl = `/reports/${reportId}.${report.format}`;
      report.fileName = `${report.name}.${report.format}`;
      report.fileSize = this.calculateFileSize(mockData);
      report.recordCount = mockData.length;
      report.completedAt = new Date();

      await this.generatedReportRepository.save(report);
    } catch (error) {
      const report = await this.generatedReportRepository.findOne({ where: { id: reportId } });
      if (report) {
        report.status = ReportStatus.FAILED;
        report.errorMessage = error.message || 'Unknown error occurred';
        await this.generatedReportRepository.save(report);
      }
    }
  }

  private async fetchReportData(template: ReportTemplate, filters: any): Promise<any[]> {
    // This would integrate with your actual data sources
    // For now, return mock data based on template
    const mockRecordCount = Math.floor(Math.random() * 1000) + 100;
    return Array.from({ length: mockRecordCount }, (_, i) => ({ id: i, data: 'mock' }));
  }

  private calculateFileSize(data: any[]): string {
    const bytes = data.length * 1024; // Rough estimate
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(1)} MB`;
  }

  private calculateExpiryDate(days: number): Date {
    const date = new Date();
    date.setDate(date.getDate() + days);
    return date;
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async getAllGeneratedReports(tenantId: string, filters?: {
    status?: ReportStatus;
    templateId?: string;
    generatedBy?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<GeneratedReport[]> {
    const where: any = { tenantId };

    if (filters?.status) where.status = filters.status;
    if (filters?.templateId) where.templateId = filters.templateId;
    if (filters?.generatedBy) where.generatedBy = filters.generatedBy;

    if (filters?.startDate && filters?.endDate) {
      where.createdAt = Between(new Date(filters.startDate), new Date(filters.endDate));
    }

    return this.generatedReportRepository.find({
      where,
      relations: ['template'],
      order: { createdAt: 'DESC' },
    });
  }

  async getGeneratedReportById(tenantId: string, id: string): Promise<GeneratedReport> {
    const report = await this.generatedReportRepository.findOne({
      where: { id, tenantId },
      relations: ['template'],
    });

    if (!report) {
      throw new NotFoundException(`Generated report with ID ${id} not found`);
    }

    return report;
  }

  async downloadReport(tenantId: string, id: string): Promise<{ url: string; fileName: string }> {
    const report = await this.getGeneratedReportById(tenantId, id);

    if (report.status !== ReportStatus.READY) {
      throw new BadRequestException('Report is not ready for download');
    }

    if (!report.fileUrl || !report.fileName) {
      throw new BadRequestException('Report file not available');
    }

    // Increment download count
    report.downloadCount += 1;
    await this.generatedReportRepository.save(report);

    return {
      url: report.fileUrl,
      fileName: report.fileName,
    };
  }

  async deleteGeneratedReport(tenantId: string, id: string): Promise<void> {
    const report = await this.getGeneratedReportById(tenantId, id);
    await this.generatedReportRepository.remove(report);
  }

  // ==================== SCHEDULED REPORTS ====================

  async createScheduledReport(tenantId: string, userId: string, dto: CreateScheduledReportDto): Promise<ScheduledReport> {
    const template = await this.getTemplateById(tenantId, dto.templateId);

    const nextRunAt = this.calculateNextRunTime(
      dto.frequency,
      dto.scheduleTime,
      dto.dayOfWeek,
      dto.dayOfMonth,
    );

    const schedule = this.scheduledReportRepository.create({
      ...dto,
      tenantId,
      createdBy: userId,
      status: ScheduleStatus.ACTIVE,
      nextRunAt,
      runCount: 0,
    });

    return this.scheduledReportRepository.save(schedule);
  }

  private calculateNextRunTime(
    frequency: ScheduleFrequency,
    time?: string,
    dayOfWeek?: number,
    dayOfMonth?: number,
  ): Date {
    const now = new Date();
    const next = new Date();

    // Set time if provided
    if (time) {
      const [hours, minutes] = time.split(':').map(Number);
      next.setHours(hours, minutes, 0, 0);
    }

    switch (frequency) {
      case ScheduleFrequency.DAILY:
        if (next <= now) {
          next.setDate(next.getDate() + 1);
        }
        break;

      case ScheduleFrequency.WEEKLY:
        if (dayOfWeek !== undefined) {
          next.setDate(next.getDate() + ((dayOfWeek + 7 - next.getDay()) % 7 || 7));
        }
        break;

      case ScheduleFrequency.MONTHLY:
        if (dayOfMonth !== undefined) {
          next.setDate(dayOfMonth);
          if (next <= now) {
            next.setMonth(next.getMonth() + 1);
          }
        }
        break;

      case ScheduleFrequency.QUARTERLY:
        next.setMonth(next.getMonth() + 3);
        break;

      case ScheduleFrequency.ANNUALLY:
        next.setFullYear(next.getFullYear() + 1);
        break;

      default:
        next.setDate(next.getDate() + 1);
    }

    return next;
  }

  async getAllScheduledReports(tenantId: string, filters?: {
    status?: ScheduleStatus;
    frequency?: ScheduleFrequency;
  }): Promise<ScheduledReport[]> {
    const where: any = { tenantId };

    if (filters?.status) where.status = filters.status;
    if (filters?.frequency) where.frequency = filters.frequency;

    return this.scheduledReportRepository.find({
      where,
      relations: ['template'],
      order: { nextRunAt: 'ASC' },
    });
  }

  async getScheduledReportById(tenantId: string, id: string): Promise<ScheduledReport> {
    const schedule = await this.scheduledReportRepository.findOne({
      where: { id, tenantId },
      relations: ['template'],
    });

    if (!schedule) {
      throw new NotFoundException(`Scheduled report with ID ${id} not found`);
    }

    return schedule;
  }

  async updateScheduledReport(tenantId: string, id: string, dto: UpdateScheduledReportDto): Promise<ScheduledReport> {
    const schedule = await this.getScheduledReportById(tenantId, id);

    Object.assign(schedule, dto);

    // Recalculate next run time if frequency or timing changed
    if (dto.frequency || dto.scheduleTime || dto.dayOfWeek !== undefined || dto.dayOfMonth !== undefined) {
      schedule.nextRunAt = this.calculateNextRunTime(
        schedule.frequency,
        schedule.scheduleTime || undefined,
        schedule.dayOfWeek || undefined,
        schedule.dayOfMonth || undefined,
      );
    }

    return this.scheduledReportRepository.save(schedule);
  }

  async deleteScheduledReport(tenantId: string, id: string): Promise<void> {
    const schedule = await this.getScheduledReportById(tenantId, id);
    await this.scheduledReportRepository.remove(schedule);
  }

  async pauseScheduledReport(tenantId: string, id: string): Promise<ScheduledReport> {
    const schedule = await this.getScheduledReportById(tenantId, id);
    schedule.status = ScheduleStatus.PAUSED;
    return this.scheduledReportRepository.save(schedule);
  }

  async resumeScheduledReport(tenantId: string, id: string): Promise<ScheduledReport> {
    const schedule = await this.getScheduledReportById(tenantId, id);
    schedule.status = ScheduleStatus.ACTIVE;
    schedule.nextRunAt = this.calculateNextRunTime(
      schedule.frequency,
      schedule.scheduleTime || undefined,
      schedule.dayOfWeek || undefined,
      schedule.dayOfMonth || undefined,
    );
    return this.scheduledReportRepository.save(schedule);
  }

  // ==================== ANALYTICS ====================

  async getReportsDashboard(tenantId: string): Promise<{
    templates: { total: number; active: number; byType: Record<string, number> };
    generated: { total: number; ready: number; processing: number; failed: number };
    scheduled: { total: number; active: number; paused: number };
    recent: GeneratedReport[];
  }> {
    const [templates, generatedReports, scheduledReports] = await Promise.all([
      this.templateRepository.find({ where: { tenantId } }),
      this.generatedReportRepository.find({ where: { tenantId } }),
      this.scheduledReportRepository.find({ where: { tenantId } }),
    ]);

    const byType: Record<string, number> = {};
    templates.forEach(t => {
      byType[t.type] = (byType[t.type] || 0) + 1;
    });

    const recent = await this.generatedReportRepository.find({
      where: { tenantId },
      relations: ['template'],
      order: { createdAt: 'DESC' },
      take: 10,
    });

    return {
      templates: {
        total: templates.length,
        active: templates.filter(t => t.isActive).length,
        byType,
      },
      generated: {
        total: generatedReports.length,
        ready: generatedReports.filter(r => r.status === ReportStatus.READY).length,
        processing: generatedReports.filter(r => r.status === ReportStatus.PROCESSING).length,
        failed: generatedReports.filter(r => r.status === ReportStatus.FAILED).length,
      },
      scheduled: {
        total: scheduledReports.length,
        active: scheduledReports.filter(s => s.status === ScheduleStatus.ACTIVE).length,
        paused: scheduledReports.filter(s => s.status === ScheduleStatus.PAUSED).length,
      },
      recent,
    };
  }
}
