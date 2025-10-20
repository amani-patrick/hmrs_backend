import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiSecurity, ApiQuery } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { PerformanceService } from './performance.service';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/enums/roles.enum';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { CreateGoalDto } from './dto/create-goal.dto';
import { UpdateGoalDto } from './dto/update-goal.dto';
import { CreateFeedbackDto } from './dto/create-feedback.dto';
import { CreateKpiDto } from './dto/create-kpi.dto';
import { RecordKpiDto } from './dto/record-kpi.dto';
import { ReviewStatus, ReviewType } from './entities/performance-review.entity';
import { GoalStatus } from './entities/goal.entity';
import { FeedbackStatus } from './entities/feedback.entity';
import { KpiStatus } from './entities/kpi.entity';

@ApiTags('Performance')
@ApiBearerAuth()
@ApiSecurity('tenant-id')
@Controller('performance')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class PerformanceController {
  constructor(private readonly performanceService: PerformanceService) {}

  // ==================== REVIEWS ====================

  @Post('reviews')
  @Roles(Role.ADMIN, Role.HR, Role.MANAGER)
  @ApiOperation({ summary: 'Create performance review' })
  @ApiResponse({ status: 201, description: 'Review created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async createReview(@Req() req: any, @Body() dto: CreateReviewDto) {
    const tenantId = req.tenantId;
    const userId = req.user.userId;
    return this.performanceService.createReview(tenantId, userId, dto);
  }

  @Get('reviews')
  @Roles(Role.ADMIN, Role.HR, Role.MANAGER)
  @ApiOperation({ summary: 'Get all performance reviews' })
  @ApiQuery({ name: 'employeeId', required: false })
  @ApiQuery({ name: 'reviewerId', required: false })
  @ApiQuery({ name: 'status', enum: ReviewStatus, required: false })
  @ApiQuery({ name: 'reviewType', enum: ReviewType, required: false })
  @ApiQuery({ name: 'startDate', required: false })
  @ApiQuery({ name: 'endDate', required: false })
  @ApiResponse({ status: 200, description: 'Reviews retrieved successfully' })
  async getAllReviews(
    @Req() req: any,
    @Query('employeeId') employeeId?: string,
    @Query('reviewerId') reviewerId?: string,
    @Query('status') status?: ReviewStatus,
    @Query('reviewType') reviewType?: ReviewType,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.performanceService.getAllReviews(req.tenantId, {
      employeeId,
      reviewerId,
      status,
      reviewType,
      startDate,
      endDate,
    });
  }

  @Get('reviews/my')
  @ApiOperation({ summary: 'Get my performance reviews' })
  @ApiResponse({ status: 200, description: 'My reviews retrieved successfully' })
  async getMyReviews(@Req() req: any) {
    const employeeId = req.user.userId;
    return this.performanceService.getEmployeeReviews(req.tenantId, employeeId);
  }

  @Get('reviews/:id')
  @ApiOperation({ summary: 'Get review by ID' })
  @ApiResponse({ status: 200, description: 'Review retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Review not found' })
  async getReviewById(@Req() req: any, @Param('id') id: string) {
    return this.performanceService.getReviewById(req.tenantId, id);
  }

  @Put('reviews/:id')
  @Roles(Role.ADMIN, Role.HR, Role.MANAGER)
  @ApiOperation({ summary: 'Update review' })
  @ApiResponse({ status: 200, description: 'Review updated successfully' })
  @ApiResponse({ status: 404, description: 'Review not found' })
  async updateReview(
    @Req() req: any,
    @Param('id') id: string,
    @Body() dto: UpdateReviewDto,
  ) {
    return this.performanceService.updateReview(req.tenantId, id, dto);
  }

  @Delete('reviews/:id')
  @Roles(Role.ADMIN, Role.HR)
  @ApiOperation({ summary: 'Delete review' })
  @ApiResponse({ status: 200, description: 'Review deleted successfully' })
  @ApiResponse({ status: 400, description: 'Cannot delete completed review' })
  async deleteReview(@Req() req: any, @Param('id') id: string) {
    await this.performanceService.deleteReview(req.tenantId, id);
    return { message: 'Review deleted successfully' };
  }

  @Post('reviews/:id/acknowledge')
  @ApiOperation({ summary: 'Acknowledge review (employee only)' })
  @ApiResponse({ status: 200, description: 'Review acknowledged successfully' })
  @ApiResponse({ status: 400, description: 'Only the employee can acknowledge' })
  async acknowledgeReview(@Req() req: any, @Param('id') id: string) {
    const userId = req.user.userId;
    return this.performanceService.acknowledgeReview(req.tenantId, id, userId);
  }

  // ==================== GOALS ====================

  @Post('goals')
  @ApiOperation({ summary: 'Create goal' })
  @ApiResponse({ status: 201, description: 'Goal created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async createGoal(@Req() req: any, @Body() dto: CreateGoalDto) {
    const tenantId = req.tenantId;
    const userId = req.user.userId;
    return this.performanceService.createGoal(tenantId, userId, dto);
  }

  @Get('goals')
  @ApiOperation({ summary: 'Get all goals' })
  @ApiQuery({ name: 'ownerId', required: false })
  @ApiQuery({ name: 'status', enum: GoalStatus, required: false })
  @ApiQuery({ name: 'type', required: false })
  @ApiQuery({ name: 'dueDateFrom', required: false })
  @ApiQuery({ name: 'dueDateTo', required: false })
  @ApiResponse({ status: 200, description: 'Goals retrieved successfully' })
  async getAllGoals(
    @Req() req: any,
    @Query('ownerId') ownerId?: string,
    @Query('status') status?: GoalStatus,
    @Query('type') type?: string,
    @Query('dueDateFrom') dueDateFrom?: string,
    @Query('dueDateTo') dueDateTo?: string,
  ) {
    return this.performanceService.getAllGoals(req.tenantId, {
      ownerId,
      status,
      type,
      dueDateFrom,
      dueDateTo,
    });
  }

  @Get('goals/my')
  @ApiOperation({ summary: 'Get my goals' })
  @ApiResponse({ status: 200, description: 'My goals retrieved successfully' })
  async getMyGoals(@Req() req: any) {
    const ownerId = req.user.userId;
    return this.performanceService.getMyGoals(req.tenantId, ownerId);
  }

  @Get('goals/statistics')
  @Roles(Role.ADMIN, Role.HR, Role.MANAGER)
  @ApiOperation({ summary: 'Get goal statistics' })
  @ApiQuery({ name: 'ownerId', required: false })
  @ApiResponse({ status: 200, description: 'Statistics retrieved successfully' })
  async getGoalStatistics(
    @Req() req: any,
    @Query('ownerId') ownerId?: string,
  ) {
    return this.performanceService.getGoalStatistics(req.tenantId, ownerId);
  }

  @Get('goals/:id')
  @ApiOperation({ summary: 'Get goal by ID' })
  @ApiResponse({ status: 200, description: 'Goal retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Goal not found' })
  async getGoalById(@Req() req: any, @Param('id') id: string) {
    return this.performanceService.getGoalById(req.tenantId, id);
  }

  @Put('goals/:id')
  @ApiOperation({ summary: 'Update goal' })
  @ApiResponse({ status: 200, description: 'Goal updated successfully' })
  @ApiResponse({ status: 404, description: 'Goal not found' })
  async updateGoal(
    @Req() req: any,
    @Param('id') id: string,
    @Body() dto: UpdateGoalDto,
  ) {
    return this.performanceService.updateGoal(req.tenantId, id, dto);
  }

  @Delete('goals/:id')
  @ApiOperation({ summary: 'Delete goal' })
  @ApiResponse({ status: 200, description: 'Goal deleted successfully' })
  async deleteGoal(@Req() req: any, @Param('id') id: string) {
    await this.performanceService.deleteGoal(req.tenantId, id);
    return { message: 'Goal deleted successfully' };
  }

  // ==================== FEEDBACK ====================

  @Post('feedback')
  @ApiOperation({ summary: 'Create feedback' })
  @ApiResponse({ status: 201, description: 'Feedback created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async createFeedback(@Req() req: any, @Body() dto: CreateFeedbackDto) {
    return this.performanceService.createFeedback(req.tenantId, dto);
  }

  @Post('feedback/:id/submit')
  @ApiOperation({ summary: 'Submit feedback' })
  @ApiResponse({ status: 200, description: 'Feedback submitted successfully' })
  async submitFeedback(@Req() req: any, @Param('id') id: string) {
    return this.performanceService.submitFeedback(req.tenantId, id);
  }

  @Get('feedback')
  @ApiOperation({ summary: 'Get all feedback' })
  @ApiQuery({ name: 'recipientId', required: false })
  @ApiQuery({ name: 'giverId', required: false })
  @ApiQuery({ name: 'status', enum: FeedbackStatus, required: false })
  @ApiQuery({ name: 'type', required: false })
  @ApiResponse({ status: 200, description: 'Feedback retrieved successfully' })
  async getAllFeedback(
    @Req() req: any,
    @Query('recipientId') recipientId?: string,
    @Query('giverId') giverId?: string,
    @Query('status') status?: FeedbackStatus,
    @Query('type') type?: string,
  ) {
    return this.performanceService.getAllFeedback(req.tenantId, {
      recipientId,
      giverId,
      status,
      type,
    });
  }

  @Get('feedback/my')
  @ApiOperation({ summary: 'Get my feedback' })
  @ApiResponse({ status: 200, description: 'My feedback retrieved successfully' })
  async getMyFeedback(@Req() req: any) {
    const recipientId = req.user.userId;
    return this.performanceService.getMyFeedback(req.tenantId, recipientId);
  }

  @Get('feedback/:id')
  @ApiOperation({ summary: 'Get feedback by ID' })
  @ApiResponse({ status: 200, description: 'Feedback retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Feedback not found' })
  async getFeedbackById(@Req() req: any, @Param('id') id: string) {
    return this.performanceService.getFeedbackById(req.tenantId, id);
  }

  @Post('feedback/:id/acknowledge')
  @ApiOperation({ summary: 'Acknowledge feedback (recipient only)' })
  @ApiResponse({ status: 200, description: 'Feedback acknowledged successfully' })
  @ApiResponse({ status: 400, description: 'Only the recipient can acknowledge' })
  async acknowledgeFeedback(@Req() req: any, @Param('id') id: string) {
    const userId = req.user.userId;
    return this.performanceService.acknowledgeFeedback(req.tenantId, id, userId);
  }

  // ==================== KPIs ====================

  @Post('kpis')
  @Roles(Role.ADMIN, Role.HR, Role.MANAGER)
  @ApiOperation({ summary: 'Create KPI' })
  @ApiResponse({ status: 201, description: 'KPI created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async createKPI(@Req() req: any, @Body() dto: CreateKpiDto) {
    const tenantId = req.tenantId;
    const userId = req.user.userId;
    return this.performanceService.createKPI(tenantId, userId, dto);
  }

  @Get('kpis')
  @ApiOperation({ summary: 'Get all KPIs' })
  @ApiQuery({ name: 'departmentId', required: false })
  @ApiQuery({ name: 'category', required: false })
  @ApiQuery({ name: 'status', enum: KpiStatus, required: false })
  @ApiResponse({ status: 200, description: 'KPIs retrieved successfully' })
  async getAllKPIs(
    @Req() req: any,
    @Query('departmentId') departmentId?: string,
    @Query('category') category?: string,
    @Query('status') status?: KpiStatus,
  ) {
    return this.performanceService.getAllKPIs(req.tenantId, {
      departmentId,
      category,
      status,
    });
  }

  @Get('kpis/:id')
  @ApiOperation({ summary: 'Get KPI by ID' })
  @ApiResponse({ status: 200, description: 'KPI retrieved successfully' })
  @ApiResponse({ status: 404, description: 'KPI not found' })
  async getKPIById(@Req() req: any, @Param('id') id: string) {
    return this.performanceService.getKPIById(req.tenantId, id);
  }

  @Post('kpis/record')
  @ApiOperation({ summary: 'Record KPI value' })
  @ApiResponse({ status: 201, description: 'KPI recorded successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async recordKPI(@Req() req: any, @Body() dto: RecordKpiDto) {
    const tenantId = req.tenantId;
    const userId = req.user.userId;
    return this.performanceService.recordKPI(tenantId, userId, dto);
  }

  @Get('kpis/records')
  @ApiOperation({ summary: 'Get KPI records' })
  @ApiQuery({ name: 'kpiId', required: false })
  @ApiQuery({ name: 'employeeId', required: false })
  @ApiQuery({ name: 'departmentId', required: false })
  @ApiQuery({ name: 'startDate', required: false })
  @ApiQuery({ name: 'endDate', required: false })
  @ApiResponse({ status: 200, description: 'KPI records retrieved successfully' })
  async getKPIRecords(
    @Req() req: any,
    @Query('kpiId') kpiId?: string,
    @Query('employeeId') employeeId?: string,
    @Query('departmentId') departmentId?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.performanceService.getKPIRecords(req.tenantId, {
      kpiId,
      employeeId,
      departmentId,
      startDate,
      endDate,
    });
  }

  @Get('kpis/:id/analytics')
  @Roles(Role.ADMIN, Role.HR, Role.MANAGER)
  @ApiOperation({ summary: 'Get KPI analytics' })
  @ApiQuery({ name: 'startDate', required: true })
  @ApiQuery({ name: 'endDate', required: true })
  @ApiResponse({ status: 200, description: 'KPI analytics retrieved successfully' })
  async getKPIAnalytics(
    @Req() req: any,
    @Param('id') id: string,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    return this.performanceService.getKPIAnalytics(req.tenantId, id, startDate, endDate);
  }

  // ==================== ANALYTICS ====================

  @Get('dashboard')
  @Roles(Role.ADMIN, Role.HR, Role.MANAGER)
  @ApiOperation({ summary: 'Get performance dashboard' })
  @ApiResponse({ status: 200, description: 'Dashboard retrieved successfully' })
  async getDashboard(@Req() req: any) {
    return this.performanceService.getPerformanceDashboard(req.tenantId);
  }
}
