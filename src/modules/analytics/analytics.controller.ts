import { Controller, Get, Query, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AnalyticsRealService } from './analytics.service';
import { AnalyticsQueryDto } from './dto/analytics-query.dto';

@ApiTags('Analytics')
@ApiBearerAuth()
@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsRealService) {}

  // ==================== HEADCOUNT ANALYTICS ====================

  @Get('headcount')
  @ApiOperation({ summary: 'Get headcount metrics and trends' })
  @ApiResponse({ status: 200, description: 'Headcount analytics data' })
  async getHeadcountMetrics(@Request() req, @Query() query: AnalyticsQueryDto) {
    return this.analyticsService.getHeadcountMetrics(req.user.tenantId, query);
  }

  // ==================== TURNOVER & RETENTION ====================

  @Get('turnover')
  @ApiOperation({ summary: 'Get turnover and retention metrics' })
  @ApiResponse({ status: 200, description: 'Turnover analytics data' })
  async getTurnoverMetrics(@Request() req, @Query() query: AnalyticsQueryDto) {
    return this.analyticsService.getTurnoverMetrics(req.user.tenantId, query);
  }

  // ==================== ATTENDANCE ANALYTICS ====================

  @Get('attendance')
  @ApiOperation({ summary: 'Get attendance metrics and patterns' })
  @ApiResponse({ status: 200, description: 'Attendance analytics data' })
  async getAttendanceMetrics(@Request() req, @Query() query: AnalyticsQueryDto) {
    return this.analyticsService.getAttendanceMetrics(req.user.tenantId, query);
  }

  // ==================== LEAVE ANALYTICS ====================

  @Get('leave')
  @ApiOperation({ summary: 'Get leave metrics and trends' })
  @ApiResponse({ status: 200, description: 'Leave analytics data' })
  async getLeaveMetrics(@Request() req, @Query() query: AnalyticsQueryDto) {
    return this.analyticsService.getLeaveMetrics(req.user.tenantId, query);
  }

  // ==================== PERFORMANCE ANALYTICS ====================

  @Get('performance')
  @ApiOperation({ summary: 'Get performance metrics and distribution' })
  @ApiResponse({ status: 200, description: 'Performance analytics data' })
  async getPerformanceMetrics(@Request() req, @Query() query: AnalyticsQueryDto) {
    return this.analyticsService.getPerformanceMetrics(req.user.tenantId, query);
  }

  // ==================== TRAINING ANALYTICS ====================

  @Get('training')
  @ApiOperation({ summary: 'Get training metrics and ROI' })
  @ApiResponse({ status: 200, description: 'Training analytics data' })
  async getTrainingMetrics(@Request() req, @Query() query: AnalyticsQueryDto) {
    return this.analyticsService.getTrainingMetrics(req.user.tenantId, query);
  }

  // ==================== PAYROLL ANALYTICS ====================

  @Get('payroll')
  @ApiOperation({ summary: 'Get payroll expense analytics' })
  @ApiResponse({ status: 200, description: 'Payroll analytics data' })
  async getPayrollMetrics(@Request() req, @Query() query: AnalyticsQueryDto) {
    return this.analyticsService.getPayrollMetrics(req.user.tenantId, query);
  }

  // ==================== RECRUITMENT ANALYTICS ====================

  @Get('recruitment')
  @ApiOperation({ summary: 'Get recruitment metrics and effectiveness' })
  @ApiResponse({ status: 200, description: 'Recruitment analytics data' })
  async getRecruitmentMetrics(@Request() req, @Query() query: AnalyticsQueryDto) {
    return this.analyticsService.getRecruitmentMetrics(req.user.tenantId, query);
  }

  // ==================== COMPARATIVE ANALYTICS ====================

  @Get('comparative')
  @ApiOperation({ summary: 'Get comparative analytics (YoY, MoM, benchmarks)' })
  @ApiResponse({ status: 200, description: 'Comparative analytics data' })
  async getComparativeAnalytics(@Request() req, @Query() query: AnalyticsQueryDto) {
    return this.analyticsService.getComparativeAnalytics(req.user.tenantId, query);
  }

  // ==================== PREDICTIVE ANALYTICS ====================

  @Get('predictive')
  @ApiOperation({ summary: 'Get predictive analytics and forecasts' })
  @ApiResponse({ status: 200, description: 'Predictive analytics data' })
  async getPredictiveAnalytics(@Request() req) {
    return this.analyticsService.getPredictiveAnalytics(req.user.tenantId);
  }

  // ==================== SUMMARY DASHBOARD ====================

  @Get('dashboard/summary')
  @ApiOperation({ summary: 'Get executive dashboard summary with key metrics' })
  @ApiResponse({ status: 200, description: 'Dashboard summary data' })
  async getDashboardSummary(@Request() req, @Query() query: AnalyticsQueryDto) {
    const [headcount, turnover, attendance, performance] = await Promise.all([
      this.analyticsService.getHeadcountMetrics(req.user.tenantId, query),
      this.analyticsService.getTurnoverMetrics(req.user.tenantId, query),
      this.analyticsService.getAttendanceMetrics(req.user.tenantId, query),
      this.analyticsService.getPerformanceMetrics(req.user.tenantId, query),
    ]);

    return {
      headcount: {
        current: headcount.current,
        change: headcount.changePercent,
      },
      turnover: {
        rate: turnover.turnoverRate,
        retention: turnover.retentionRate,
      },
      attendance: {
        rate: attendance.averageAttendanceRate,
        absences: attendance.totalAbsences,
      },
      performance: {
        avgRating: performance.averageRating,
        completionRate: performance.reviewCompletionRate,
      },
    };
  }

  // ==================== HR METRICS OVERVIEW ====================

  @Get('hr/overview')
  @ApiOperation({ summary: 'Get comprehensive HR metrics overview' })
  @ApiResponse({ status: 200, description: 'HR metrics overview' })
  async getHROverview(@Request() req, @Query() query: AnalyticsQueryDto) {
    const [
      headcount,
      turnover,
      leave,
      training,
      recruitment,
    ] = await Promise.all([
      this.analyticsService.getHeadcountMetrics(req.user.tenantId, query),
      this.analyticsService.getTurnoverMetrics(req.user.tenantId, query),
      this.analyticsService.getLeaveMetrics(req.user.tenantId, query),
      this.analyticsService.getTrainingMetrics(req.user.tenantId, query),
      this.analyticsService.getRecruitmentMetrics(req.user.tenantId, query),
    ]);

    return {
      workforce: {
        totalEmployees: headcount.current,
        newHires: turnover.newHires,
        terminations: turnover.terminations,
        openPositions: recruitment.openPositions,
      },
      engagement: {
        turnoverRate: turnover.turnoverRate,
        retentionRate: turnover.retentionRate,
        averageTenure: turnover.averageTenure.overall,
      },
      development: {
        trainingPrograms: training.totalPrograms,
        completionRate: training.completionRate,
        certificationsEarned: training.certificationsEarned,
      },
      recruitment: {
        applications: recruitment.totalApplications,
        timeToHire: recruitment.timeToHire.average,
        costPerHire: recruitment.costPerHire.average,
      },
      leave: {
        totalRequests: leave.totalLeaveRequests,
        approvalRate: leave.approvalRate,
        utilizationRate: leave.utilizationRate,
      },
    };
  }

  // ==================== ADMIN METRICS ====================

  @Get('admin/financial')
  @ApiOperation({ summary: 'Get financial metrics for admin dashboard' })
  @ApiResponse({ status: 200, description: 'Financial metrics' })
  async getFinancialMetrics(@Request() req, @Query() query: AnalyticsQueryDto) {
    const [payroll, training, recruitment] = await Promise.all([
      this.analyticsService.getPayrollMetrics(req.user.tenantId, query),
      this.analyticsService.getTrainingMetrics(req.user.tenantId, query),
      this.analyticsService.getRecruitmentMetrics(req.user.tenantId, query),
    ]);

    return {
      payroll: {
        totalExpense: payroll.totalPayrollExpense,
        averageSalary: payroll.averageSalary,
        benefitsCost: payroll.benefitsCost,
        overtimeCost: payroll.overtimeCost,
      },
      training: {
        totalCost: training.roi.totalCost,
        roi: training.roi.roiPercentage,
      },
      recruitment: {
        totalCost: recruitment.costPerHire.total,
        costPerHire: recruitment.costPerHire.average,
      },
      totalHRExpense: 
        payroll.totalPayrollExpense + 
        training.roi.totalCost + 
        recruitment.costPerHire.total,
    };
  }

  // ==================== MANAGER TEAM ANALYTICS ====================

  @Get('manager/team')
  @ApiOperation({ summary: 'Get team analytics for manager dashboard' })
  @ApiResponse({ status: 200, description: 'Team analytics' })
  async getTeamAnalytics(@Request() req, @Query() query: AnalyticsQueryDto) {
    // Would normally filter by manager's team
    const [attendance, performance, leave] = await Promise.all([
      this.analyticsService.getAttendanceMetrics(req.user.tenantId, query),
      this.analyticsService.getPerformanceMetrics(req.user.tenantId, query),
      this.analyticsService.getLeaveMetrics(req.user.tenantId, query),
    ]);

    return {
      attendance: {
        rate: attendance.averageAttendanceRate,
        lateArrivals: attendance.lateArrivals.total,
        overtimeHours: attendance.overtimeHours,
      },
      performance: {
        avgRating: performance.averageRating,
        reviewsCompleted: performance.completedReviews,
        reviewsPending: performance.pendingReviews,
        goalCompletion: performance.goalCompletion.completionRate,
      },
      leave: {
        pendingRequests: leave.pendingLeaves,
        upcomingLeaves: 3, // Would calculate from actual data
      },
    };
  }

  // ==================== EXPORT ENDPOINTS ====================

  @Get('export/headcount')
  @ApiOperation({ summary: 'Export headcount data for BI tools' })
  @ApiResponse({ status: 200, description: 'Exportable headcount data' })
  async exportHeadcount(@Request() req, @Query() query: AnalyticsQueryDto) {
    const data = await this.analyticsService.getHeadcountMetrics(req.user.tenantId, query);
    return {
      format: 'json',
      data,
      exportDate: new Date().toISOString(),
      query,
    };
  }

  @Get('export/comprehensive')
  @ApiOperation({ summary: 'Export comprehensive analytics for BI tools' })
  @ApiResponse({ status: 200, description: 'All analytics data for export' })
  async exportComprehensive(@Request() req, @Query() query: AnalyticsQueryDto) {
    const [
      headcount,
      turnover,
      attendance,
      leave,
      performance,
      training,
      payroll,
      recruitment,
    ] = await Promise.all([
      this.analyticsService.getHeadcountMetrics(req.user.tenantId, query),
      this.analyticsService.getTurnoverMetrics(req.user.tenantId, query),
      this.analyticsService.getAttendanceMetrics(req.user.tenantId, query),
      this.analyticsService.getLeaveMetrics(req.user.tenantId, query),
      this.analyticsService.getPerformanceMetrics(req.user.tenantId, query),
      this.analyticsService.getTrainingMetrics(req.user.tenantId, query),
      this.analyticsService.getPayrollMetrics(req.user.tenantId, query),
      this.analyticsService.getRecruitmentMetrics(req.user.tenantId, query),
    ]);

    return {
      format: 'json',
      exportDate: new Date().toISOString(),
      query,
      data: {
        headcount,
        turnover,
        attendance,
        leave,
        performance,
        training,
        payroll,
        recruitment,
      },
    };
  }
}
