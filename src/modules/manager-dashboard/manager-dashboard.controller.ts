import { Controller, Get, Query, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { ManagerDashboardService } from './manager-dashboard.service';

@ApiTags('Manager Dashboard')
@ApiBearerAuth()
@Controller('manager-dashboard')
export class ManagerDashboardController {
  constructor(private readonly managerDashboardService: ManagerDashboardService) {}

  // ==================== OVERVIEW ====================

  @Get('overview')
  @ApiOperation({ summary: 'Get team overview for manager' })
  @ApiResponse({ status: 200, description: 'Team overview data' })
  async getTeamOverview(@Request() req) {
    return this.managerDashboardService.getTeamOverview(req.user.tenantId, req.user.userId);
  }

  @Get('quick-stats')
  @ApiOperation({ summary: 'Get quick statistics for dashboard' })
  @ApiResponse({ status: 200, description: 'Quick stats' })
  async getQuickStats(@Request() req) {
    return this.managerDashboardService.getQuickStats(req.user.tenantId, req.user.userId);
  }

  // ==================== PENDING ACTIONS ====================

  @Get('pending-actions')
  @ApiOperation({ summary: 'Get all pending actions count' })
  @ApiResponse({ status: 200, description: 'Pending actions summary' })
  async getPendingActions(@Request() req) {
    return this.managerDashboardService.getPendingActions(req.user.tenantId, req.user.userId);
  }

  @Get('leave-requests')
  @ApiOperation({ summary: 'Get pending leave requests' })
  @ApiResponse({ status: 200, description: 'Leave requests awaiting approval' })
  async getLeaveRequests(@Request() req) {
    return this.managerDashboardService.getLeaveRequests(req.user.tenantId, req.user.userId);
  }

  @Get('timeoff-requests')
  @ApiOperation({ summary: 'Get pending time-off requests' })
  @ApiResponse({ status: 200, description: 'Time-off requests awaiting approval' })
  async getTimeoffRequests(@Request() req) {
    return this.managerDashboardService.getTimeoffRequests(req.user.tenantId, req.user.userId);
  }

  // ==================== TEAM PERFORMANCE ====================

  @Get('team-performance')
  @ApiOperation({ summary: 'Get team performance metrics' })
  @ApiResponse({ status: 200, description: 'Team performance data' })
  async getTeamPerformance(@Request() req) {
    return this.managerDashboardService.getTeamPerformance(req.user.tenantId, req.user.userId);
  }

  @Get('team-goals')
  @ApiOperation({ summary: 'Get team goals overview' })
  @ApiResponse({ status: 200, description: 'Team goals data' })
  async getTeamGoals(@Request() req) {
    return this.managerDashboardService.getTeamGoals(req.user.tenantId, req.user.userId);
  }

  // ==================== TEAM ATTENDANCE ====================

  @Get('team-attendance')
  @ApiOperation({ summary: 'Get team attendance for today or specific date' })
  @ApiQuery({ name: 'date', required: false, description: 'Date in YYYY-MM-DD format' })
  @ApiResponse({ status: 200, description: 'Team attendance data' })
  async getTeamAttendance(@Request() req, @Query('date') date?: string) {
    return this.managerDashboardService.getTeamAttendance(
      req.user.tenantId,
      req.user.userId,
      date,
    );
  }

  @Get('team-attendance/summary')
  @ApiOperation({ summary: 'Get team attendance summary for a month' })
  @ApiQuery({ name: 'month', required: false, description: 'Month in YYYY-MM format' })
  @ApiResponse({ status: 200, description: 'Team attendance summary' })
  async getTeamAttendanceSummary(@Request() req, @Query('month') month?: string) {
    const currentMonth = month || new Date().toISOString().slice(0, 7);
    return this.managerDashboardService.getTeamAttendanceSummary(
      req.user.tenantId,
      req.user.userId,
      currentMonth,
    );
  }

  // ==================== TEAM CALENDAR ====================

  @Get('team-calendar')
  @ApiOperation({ summary: 'Get team calendar with leaves, events, and milestones' })
  @ApiQuery({ name: 'startDate', required: false })
  @ApiQuery({ name: 'endDate', required: false })
  @ApiResponse({ status: 200, description: 'Team calendar data' })
  async getTeamCalendar(
    @Request() req,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const today = new Date().toISOString().split('T')[0];
    const nextMonth = new Date();
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    const defaultEndDate = nextMonth.toISOString().split('T')[0];

    return this.managerDashboardService.getTeamCalendar(
      req.user.tenantId,
      req.user.userId,
      startDate || today,
      endDate || defaultEndDate,
    );
  }

  // ==================== TEAM TRAINING ====================

  @Get('team-training')
  @ApiOperation({ summary: 'Get team training overview' })
  @ApiResponse({ status: 200, description: 'Team training data' })
  async getTeamTraining(@Request() req) {
    return this.managerDashboardService.getTeamTraining(req.user.tenantId, req.user.userId);
  }
}
