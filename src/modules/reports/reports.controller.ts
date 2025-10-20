import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiSecurity, ApiQuery } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { ReportsService } from './reports.service';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/enums/roles.enum';
import { CreateReportTemplateDto } from './dto/create-report-template.dto';
import { UpdateReportTemplateDto } from './dto/update-report-template.dto';
import { GenerateReportDto } from './dto/generate-report.dto';
import { CreateScheduledReportDto } from './dto/create-scheduled-report.dto';
import { UpdateScheduledReportDto } from './dto/update-scheduled-report.dto';
import { ReportType, ReportCategory } from './entities/report-template.entity';
import { ReportStatus } from './entities/generated-report.entity';
import { ScheduleFrequency, ScheduleStatus } from './entities/scheduled-report.entity';

@ApiTags('Reports')
@ApiBearerAuth()
@ApiSecurity('tenant-id')
@Controller('reports')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  // ==================== TEMPLATES ====================

  @Post('templates')
  @Roles(Role.ADMIN, Role.HR, Role.MANAGER)
  @ApiOperation({ summary: 'Create report template' })
  @ApiResponse({ status: 201, description: 'Template created successfully' })
  async createTemplate(@Req() req: any, @Body() dto: CreateReportTemplateDto) {
    const tenantId = req.tenantId;
    const userId = req.user.userId;
    return this.reportsService.createTemplate(tenantId, userId, dto);
  }

  @Get('templates')
  @ApiOperation({ summary: 'Get all report templates' })
  @ApiQuery({ name: 'type', enum: ReportType, required: false })
  @ApiQuery({ name: 'category', enum: ReportCategory, required: false })
  @ApiQuery({ name: 'isActive', type: Boolean, required: false })
  @ApiResponse({ status: 200, description: 'Templates retrieved successfully' })
  async getAllTemplates(
    @Req() req: any,
    @Query('type') type?: ReportType,
    @Query('category') category?: ReportCategory,
    @Query('isActive') isActive?: boolean,
  ) {
    return this.reportsService.getAllTemplates(req.tenantId, {
      type,
      category,
      isActive,
    });
  }

  @Get('templates/:id')
  @ApiOperation({ summary: 'Get template by ID' })
  @ApiResponse({ status: 200, description: 'Template retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Template not found' })
  async getTemplateById(@Req() req: any, @Param('id') id: string) {
    return this.reportsService.getTemplateById(req.tenantId, id);
  }

  @Put('templates/:id')
  @Roles(Role.ADMIN, Role.HR)
  @ApiOperation({ summary: 'Update template' })
  @ApiResponse({ status: 200, description: 'Template updated successfully' })
  @ApiResponse({ status: 400, description: 'Cannot modify system templates' })
  async updateTemplate(
    @Req() req: any,
    @Param('id') id: string,
    @Body() dto: UpdateReportTemplateDto,
  ) {
    return this.reportsService.updateTemplate(req.tenantId, id, dto);
  }

  @Delete('templates/:id')
  @Roles(Role.ADMIN, Role.HR)
  @ApiOperation({ summary: 'Delete template' })
  @ApiResponse({ status: 200, description: 'Template deleted successfully' })
  @ApiResponse({ status: 400, description: 'Cannot delete system templates' })
  async deleteTemplate(@Req() req: any, @Param('id') id: string) {
    await this.reportsService.deleteTemplate(req.tenantId, id);
    return { message: 'Template deleted successfully' };
  }

  // ==================== GENERATE REPORTS ====================

  @Post('generate')
  @Roles(Role.ADMIN, Role.HR, Role.MANAGER, Role.AUDITOR)
  @ApiOperation({ summary: 'Generate report' })
  @ApiResponse({ status: 201, description: 'Report generation initiated' })
  @ApiResponse({ status: 404, description: 'Template not found' })
  async generateReport(@Req() req: any, @Body() dto: GenerateReportDto) {
    const tenantId = req.tenantId;
    const userId = req.user.userId;
    const userFullName = req.user.fullName || req.user.email;
    return this.reportsService.generateReport(tenantId, userId, userFullName, dto);
  }

  @Get('generated')
  @ApiOperation({ summary: 'Get all generated reports' })
  @ApiQuery({ name: 'status', enum: ReportStatus, required: false })
  @ApiQuery({ name: 'templateId', required: false })
  @ApiQuery({ name: 'generatedBy', required: false })
  @ApiQuery({ name: 'startDate', required: false })
  @ApiQuery({ name: 'endDate', required: false })
  @ApiResponse({ status: 200, description: 'Reports retrieved successfully' })
  async getAllGeneratedReports(
    @Req() req: any,
    @Query('status') status?: ReportStatus,
    @Query('templateId') templateId?: string,
    @Query('generatedBy') generatedBy?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.reportsService.getAllGeneratedReports(req.tenantId, {
      status,
      templateId,
      generatedBy,
      startDate,
      endDate,
    });
  }

  @Get('generated/my')
  @ApiOperation({ summary: 'Get my generated reports' })
  @ApiResponse({ status: 200, description: 'Reports retrieved successfully' })
  async getMyGeneratedReports(@Req() req: any) {
    const userId = req.user.userId;
    return this.reportsService.getAllGeneratedReports(req.tenantId, {
      generatedBy: userId,
    });
  }

  @Get('generated/:id')
  @ApiOperation({ summary: 'Get generated report by ID' })
  @ApiResponse({ status: 200, description: 'Report retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Report not found' })
  async getGeneratedReportById(@Req() req: any, @Param('id') id: string) {
    return this.reportsService.getGeneratedReportById(req.tenantId, id);
  }

  @Get('generated/:id/download')
  @ApiOperation({ summary: 'Download report' })
  @ApiResponse({ status: 200, description: 'Download URL retrieved' })
  @ApiResponse({ status: 400, description: 'Report not ready' })
  async downloadReport(@Req() req: any, @Param('id') id: string) {
    return this.reportsService.downloadReport(req.tenantId, id);
  }

  @Delete('generated/:id')
  @ApiOperation({ summary: 'Delete generated report' })
  @ApiResponse({ status: 200, description: 'Report deleted successfully' })
  async deleteGeneratedReport(@Req() req: any, @Param('id') id: string) {
    await this.reportsService.deleteGeneratedReport(req.tenantId, id);
    return { message: 'Report deleted successfully' };
  }

  // ==================== SCHEDULED REPORTS ====================

  @Post('scheduled')
  @Roles(Role.ADMIN, Role.HR, Role.MANAGER)
  @ApiOperation({ summary: 'Create scheduled report' })
  @ApiResponse({ status: 201, description: 'Schedule created successfully' })
  async createScheduledReport(@Req() req: any, @Body() dto: CreateScheduledReportDto) {
    const tenantId = req.tenantId;
    const userId = req.user.userId;
    return this.reportsService.createScheduledReport(tenantId, userId, dto);
  }

  @Get('scheduled')
  @ApiOperation({ summary: 'Get all scheduled reports' })
  @ApiQuery({ name: 'status', enum: ScheduleStatus, required: false })
  @ApiQuery({ name: 'frequency', enum: ScheduleFrequency, required: false })
  @ApiResponse({ status: 200, description: 'Schedules retrieved successfully' })
  async getAllScheduledReports(
    @Req() req: any,
    @Query('status') status?: ScheduleStatus,
    @Query('frequency') frequency?: ScheduleFrequency,
  ) {
    return this.reportsService.getAllScheduledReports(req.tenantId, {
      status,
      frequency,
    });
  }

  @Get('scheduled/:id')
  @ApiOperation({ summary: 'Get scheduled report by ID' })
  @ApiResponse({ status: 200, description: 'Schedule retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Schedule not found' })
  async getScheduledReportById(@Req() req: any, @Param('id') id: string) {
    return this.reportsService.getScheduledReportById(req.tenantId, id);
  }

  @Put('scheduled/:id')
  @Roles(Role.ADMIN, Role.HR, Role.MANAGER)
  @ApiOperation({ summary: 'Update scheduled report' })
  @ApiResponse({ status: 200, description: 'Schedule updated successfully' })
  async updateScheduledReport(
    @Req() req: any,
    @Param('id') id: string,
    @Body() dto: UpdateScheduledReportDto,
  ) {
    return this.reportsService.updateScheduledReport(req.tenantId, id, dto);
  }

  @Delete('scheduled/:id')
  @Roles(Role.ADMIN, Role.HR)
  @ApiOperation({ summary: 'Delete scheduled report' })
  @ApiResponse({ status: 200, description: 'Schedule deleted successfully' })
  async deleteScheduledReport(@Req() req: any, @Param('id') id: string) {
    await this.reportsService.deleteScheduledReport(req.tenantId, id);
    return { message: 'Schedule deleted successfully' };
  }

  @Post('scheduled/:id/pause')
  @Roles(Role.ADMIN, Role.HR, Role.MANAGER)
  @ApiOperation({ summary: 'Pause scheduled report' })
  @ApiResponse({ status: 200, description: 'Schedule paused successfully' })
  async pauseScheduledReport(@Req() req: any, @Param('id') id: string) {
    return this.reportsService.pauseScheduledReport(req.tenantId, id);
  }

  @Post('scheduled/:id/resume')
  @Roles(Role.ADMIN, Role.HR, Role.MANAGER)
  @ApiOperation({ summary: 'Resume scheduled report' })
  @ApiResponse({ status: 200, description: 'Schedule resumed successfully' })
  async resumeScheduledReport(@Req() req: any, @Param('id') id: string) {
    return this.reportsService.resumeScheduledReport(req.tenantId, id);
  }

  // ==================== ANALYTICS ====================

  @Get('dashboard')
  @Roles(Role.ADMIN, Role.HR, Role.MANAGER)
  @ApiOperation({ summary: 'Get reports dashboard' })
  @ApiResponse({ status: 200, description: 'Dashboard retrieved successfully' })
  async getReportsDashboard(@Req() req: any) {
    return this.reportsService.getReportsDashboard(req.tenantId);
  }
}
