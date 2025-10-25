import { Injectable, Inject } from '@nestjs/common';
import { Repository, Between, MoreThanOrEqual, LessThanOrEqual, In } from 'typeorm';
import { DashboardWidget } from './entities/dashboard-widget.entity';
import { AnalyticsQueryDto, TimeRange, GroupBy } from './dto/analytics-query.dto';

interface DateRange {
  start: Date;
  end: Date;
}

@Injectable()
export class AnalyticsRealService {
  constructor(
    @Inject('DASHBOARD_WIDGET_REPOSITORY')
    private readonly widgetRepository: Repository<DashboardWidget>,
    @Inject('USER_REPOSITORY')
    private readonly userRepository: Repository<any>,
    @Inject('LEAVE_REPOSITORY')
    private readonly leaveRepository: Repository<any>,
    @Inject('ATTENDANCE_REPOSITORY')
    private readonly attendanceRepository: Repository<any>,
    @Inject('ONBOARDING_REPOSITORY')
    private readonly onboardingRepository: Repository<any>,
    @Inject('OFFBOARDING_REPOSITORY')
    private readonly offboardingRepository: Repository<any>,
  ) {}

  // ==================== HEADCOUNT ANALYTICS ====================

  async getHeadcountMetrics(tenantId: string, query: AnalyticsQueryDto) {
    const dateRange = this.getDateRange(query);
    
    // Get current active employees
    const currentEmployees = await this.userRepository.find({
      where: { 
        tenantId,
        isActive: true,
      },
    });

    // Get previous period for comparison
    const previousRange = this.getPreviousPeriodRange(dateRange);
    const previousEmployees = await this.userRepository.find({
      where: {
        tenantId,
        isActive: true,
        createdAt: LessThanOrEqual(previousRange.end),
      },
    });

    const current = currentEmployees.length;
    const previous = previousEmployees.length;
    const change = current - previous;
    const changePercent = previous > 0 ? ((change / previous) * 100) : 0;

    // Group by department
    const byDepartment = await this.groupByField(currentEmployees, 'department', previousEmployees);
    
    // Group by position
    const byPosition = await this.groupByField(currentEmployees, 'position', previousEmployees);

    // Generate trend data
    const trend = await this.generateHeadcountTrend(tenantId, dateRange, query.groupBy);

    return {
      current,
      previousPeriod: previous,
      change,
      changePercent: Math.round(changePercent * 100) / 100,
      byDepartment,
      byPosition,
      trend,
    };
  }

  // ==================== TURNOVER & RETENTION ====================

  async getTurnoverMetrics(tenantId: string, query: AnalyticsQueryDto) {
    const dateRange = this.getDateRange(query);
    
    // Get terminations in period
    const offboardings = await this.offboardingRepository.find({
      where: {
        tenantId,
        lastWorkingDay: Between(dateRange.start, dateRange.end),
      },
    });

    // Get new hires in period
    const onboardings = await this.onboardingRepository.find({
      where: {
        tenantId,
        startDate: Between(dateRange.start, dateRange.end),
      },
    });

    // Get total active employees
    const totalEmployees = await this.userRepository.count({
      where: { tenantId, isActive: true },
    });

    const terminations = offboardings.length;
    const newHires = onboardings.length;
    const turnoverRate = totalEmployees > 0 ? (terminations / totalEmployees) * 100 : 0;
    const retentionRate = 100 - turnoverRate;

    // Separate voluntary vs involuntary
    const voluntary = offboardings.filter(o => o.reason !== 'terminated' && o.reason !== 'performance').length;
    const involuntary = terminations - voluntary;
    const voluntaryTurnover = totalEmployees > 0 ? (voluntary / totalEmployees) * 100 : 0;
    const involuntaryTurnover = totalEmployees > 0 ? (involuntary / totalEmployees) * 100 : 0;

    // Group by department
    const byDepartment = await this.getTurnoverByDepartment(tenantId, dateRange, offboardings);

    // Reasons for leaving
    const reasonsForLeaving = this.groupByReason(offboardings);

    // Average tenure
    const averageTenure = await this.calculateAverageTenure(tenantId, offboardings);

    return {
      turnoverRate: Math.round(turnoverRate * 100) / 100,
      voluntaryTurnover: Math.round(voluntaryTurnover * 100) / 100,
      involuntaryTurnover: Math.round(involuntaryTurnover * 100) / 100,
      retentionRate: Math.round(retentionRate * 100) / 100,
      newHires,
      terminations,
      byDepartment,
      reasonsForLeaving,
      averageTenure,
      trend: await this.generateTurnoverTrend(tenantId, dateRange),
    };
  }

  // ==================== ATTENDANCE ANALYTICS ====================

  async getAttendanceMetrics(tenantId: string, query: AnalyticsQueryDto) {
    const dateRange = this.getDateRange(query);
    
    // Get all attendance records in range
    const attendanceRecords = await this.attendanceRepository.find({
      where: {
        tenantId,
        date: Between(dateRange.start, dateRange.end),
      },
    });

    const totalRecords = attendanceRecords.length;
    const presentRecords = attendanceRecords.filter(a => a.status === 'present' || a.status === 'late').length;
    const absentRecords = attendanceRecords.filter(a => a.status === 'absent').length;
    const lateRecords = attendanceRecords.filter(a => a.status === 'late').length;

    const attendanceRate = totalRecords > 0 ? (presentRecords / totalRecords) * 100 : 0;

    // Calculate work days
    const workDays = this.calculateWorkDays(dateRange);

    // Calculate average hours and overtime
    const totalHours = attendanceRecords.reduce((sum, a) => sum + (a.totalHours || 0), 0);
    const overtimeHours = attendanceRecords.reduce((sum, a) => sum + (a.overtimeHours || 0), 0);
    const averageHoursPerDay = totalRecords > 0 ? totalHours / totalRecords : 0;

    // Group by department
    const byDepartment = await this.getAttendanceByDepartment(tenantId, dateRange, attendanceRecords);

    return {
      averageAttendanceRate: Math.round(attendanceRate * 100) / 100,
      totalWorkDays: workDays,
      totalAbsences: absentRecords,
      averageHoursPerDay: Math.round(averageHoursPerDay * 100) / 100,
      overtimeHours,
      byDepartment,
      lateArrivals: {
        total: lateRecords,
        byDepartment: await this.getLateArrivalsByDepartment(tenantId, dateRange),
      },
      earlyDepartures: {
        total: attendanceRecords.filter(a => a.earlyDeparture).length,
        average: attendanceRecords.filter(a => a.earlyDeparture).reduce((sum, a) => sum + (a.earlyDepartureHours || 0), 0) / attendanceRecords.filter(a => a.earlyDeparture).length,
      },
      trend: await this.generateAttendanceTrend(tenantId, dateRange),
    };
  }

  // ==================== LEAVE ANALYTICS ====================

  async getLeaveMetrics(tenantId: string, query: AnalyticsQueryDto) {
    const dateRange = this.getDateRange(query);
    
    // Get leave requests in range
    const leaveRequests = await this.leaveRepository.find({
      where: {
        tenantId,
        startDate: Between(dateRange.start, dateRange.end),
      },
    });

    const totalRequests = leaveRequests.length;
    const approved = leaveRequests.filter(l => l.status === 'approved').length;
    const pending = leaveRequests.filter(l => l.status === 'pending').length;
    const rejected = leaveRequests.filter(l => l.status === 'rejected').length;
    const approvalRate = totalRequests > 0 ? (approved / totalRequests) * 100 : 0;

    // Group by leave type
    const byLeaveType = this.groupLeavesByType(leaveRequests);

    // Group by department
    const byDepartment = await this.getLeaveByDepartment(tenantId, dateRange, leaveRequests);

    // Peak months (would need year-long data)
    const peakMonths = await this.getLeaveByMonth(tenantId, leaveRequests);

    return {
      totalLeaveRequests: totalRequests,
      approvedLeaves: approved,
      pendingLeaves: pending,
      rejectedLeaves: rejected,
      approvalRate: Math.round(approvalRate * 100) / 100,
      byLeaveType,
      byDepartment,
      peakMonths,
      averageLeaveBalance: 12.5, // Would calculate from actual balance data
      utilizationRate: 68.5, // Would calculate from balance vs used
      trend: await this.generateLeaveTrend(tenantId, dateRange),
    };
  }

  // ==================== PERFORMANCE ANALYTICS ====================

  async getPerformanceMetrics(tenantId: string, query: AnalyticsQueryDto) {
    const dateRange = this.getDateRange(query);
    
    // Mock implementation for now - would integrate with performance module
    return {
      averageRating: 3.8,
      totalReviews: 120,
      completedReviews: 115,
      pendingReviews: 5,
      reviewCompletionRate: 95.8,
      ratingDistribution: [
        { rating: 5, count: 25, percentage: 21.7 },
        { rating: 4, count: 55, percentage: 47.8 },
        { rating: 3, count: 30, percentage: 26.1 },
        { rating: 2, count: 5, percentage: 4.4 },
        { rating: 1, count: 0, percentage: 0 },
      ],
      byDepartment: [],
      goalCompletion: {
        total: 450,
        completed: 380,
        inProgress: 50,
        notStarted: 20,
        completionRate: 84.4,
      },
      topPerformers: [],
      trend: [],
    };
  }

  // ==================== TRAINING ANALYTICS ====================

  async getTrainingMetrics(tenantId: string, query: AnalyticsQueryDto) {
    const dateRange = this.getDateRange(query);
    
    // Mock implementation for now - would integrate with training module
    return {
      totalPrograms: 45,
      activePrograms: 30,
      totalEnrollments: 520,
      completedEnrollments: 380,
      completionRate: 73.1,
      averageScore: 85.5,
      byCategory: [],
      byDepartment: [],
      certificationsEarned: 85,
      trainingHours: 2400,
      averageHoursPerEmployee: 16,
      roi: {
        totalCost: 50000,
        estimatedValue: 150000,
        roiPercentage: 200,
      },
      trend: [],
    };
  }

  // ==================== PAYROLL ANALYTICS ====================

  async getPayrollMetrics(tenantId: string, query: AnalyticsQueryDto) {
    const dateRange = this.getDateRange(query);
    
    // Mock implementation for now - would integrate with payroll module
    return {
      totalPayrollExpense: 1250000,
      averageSalary: 8333,
      medianSalary: 7500,
      totalBonuses: 125000,
      totalDeductions: 187500,
      netPayroll: 1187500,
      byDepartment: [],
      salaryBands: [],
      overtimeCost: 35000,
      benefitsCost: 187500,
      taxWithheld: 250000,
      trend: [],
    };
  }

  // ==================== RECRUITMENT ANALYTICS ====================

  async getRecruitmentMetrics(tenantId: string, query: AnalyticsQueryDto) {
    const dateRange = this.getDateRange(query);
    
    // Mock implementation for now - would integrate with recruitment module
    return {
      totalApplications: 450,
      openPositions: 25,
      closedPositions: 15,
      hires: 12,
      rejections: 320,
      inProgress: 118,
      timeToHire: {
        average: 32,
        median: 28,
        byDepartment: [],
      },
      costPerHire: {
        average: 4200,
        total: 50400,
      },
      sourceEffectiveness: [],
      conversionRates: {
        applicationToInterview: 26.2,
        interviewToOffer: 15.3,
        offerToHire: 80.0,
      },
      offerAcceptanceRate: 80.0,
      trend: [],
    };
  }

  // ==================== PREDICTIVE ANALYTICS ====================

  async getPredictiveAnalytics(tenantId: string) {
    // Mock implementation for now - would use ML models
    return {
      attritionRisk: [],
      hiringNeeds: {
        next30Days: 5,
        next60Days: 10,
        next90Days: 15,
        byDepartment: [],
      },
      budgetForecast: {
        nextQuarter: 3850000,
        nextYear: 15800000,
        breakdown: [],
      },
    };
  }

  // ==================== COMPARATIVE ANALYTICS ====================

  async getComparativeAnalytics(tenantId: string, query: AnalyticsQueryDto) {
    const currentRange = this.getDateRange(query);
    const previousRange = this.getPreviousPeriodRange(currentRange);

    // Get metrics for both periods
    const currentHeadcount = await this.userRepository.count({
      where: { tenantId, isActive: true },
    });

    const previousHeadcount = await this.userRepository.count({
      where: {
        tenantId,
        createdAt: LessThanOrEqual(previousRange.end),
      },
    });

    // Calculate changes
    const headcountChange = currentHeadcount - previousHeadcount;
    const headcountChangePercent = previousHeadcount > 0 ? (headcountChange / previousHeadcount) * 100 : 0;

    return {
      yearOverYear: {
        headcount: {
          current: currentHeadcount,
          previous: previousHeadcount,
          change: Math.round(headcountChangePercent * 100) / 100,
        },
        // Add other YoY metrics here
      },
      monthOverMonth: {
        // Add MoM metrics
      },
      benchmarks: {
        // Industry benchmarks (would come from external data)
        turnoverRate: { company: 12.5, industry: 15.0, difference: -2.5 },
        attendanceRate: { company: 96.5, industry: 94.0, difference: 2.5 },
        trainingHours: { company: 16, industry: 12, difference: 4 },
      },
    };
  }

  // ==================== HELPER METHODS ====================

  private getDateRange(query: AnalyticsQueryDto): DateRange {
    const now = new Date();
    let start: Date;
    let end: Date = now;

    if (query.timeRange === TimeRange.CUSTOM && query.startDate && query.endDate) {
      return {
        start: new Date(query.startDate),
        end: new Date(query.endDate),
      };
    }

    switch (query.timeRange) {
      case TimeRange.TODAY:
        start = new Date(now.setHours(0, 0, 0, 0));
        break;
      case TimeRange.YESTERDAY:
        start = new Date(now.setDate(now.getDate() - 1));
        start.setHours(0, 0, 0, 0);
        end = new Date(start);
        end.setHours(23, 59, 59, 999);
        break;
      case TimeRange.THIS_WEEK:
        start = new Date(now.setDate(now.getDate() - now.getDay()));
        start.setHours(0, 0, 0, 0);
        break;
      case TimeRange.THIS_MONTH:
        start = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case TimeRange.LAST_MONTH:
        start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        end = new Date(now.getFullYear(), now.getMonth(), 0);
        break;
      case TimeRange.THIS_YEAR:
        start = new Date(now.getFullYear(), 0, 1);
        break;
      default:
        start = new Date(now.getFullYear(), now.getMonth(), 1);
    }

    return { start, end };
  }

  private getPreviousPeriodRange(currentRange: DateRange): DateRange {
    const duration = currentRange.end.getTime() - currentRange.start.getTime();
    const start = new Date(currentRange.start.getTime() - duration);
    const end = new Date(currentRange.end.getTime() - duration);
    return { start, end };
  }

  private async groupByField(current: any[], field: string, previous: any[]): Promise<any[]> {
    const groups: any = {};
    
    // Count current
    current.forEach(item => {
      const key = item[field] || 'Unknown';
      if (!groups[key]) groups[key] = { current: 0, previous: 0 };
      groups[key].current++;
    });

    // Count previous
    previous.forEach(item => {
      const key = item[field] || 'Unknown';
      if (!groups[key]) groups[key] = { current: 0, previous: 0 };
      groups[key].previous++;
    });

    // Convert to array
    return Object.keys(groups).map(key => ({
      [field]: key,
      count: groups[key].current,
      change: groups[key].current - groups[key].previous,
    }));
  }

  private async generateHeadcountTrend(tenantId: string, dateRange: DateRange, groupBy?: GroupBy): Promise<any[]> {
    // Would implement actual trend calculation based on groupBy
    // For now, return basic structure
    return [];
  }

  private async getTurnoverByDepartment(tenantId: string, dateRange: DateRange, offboardings: any[]): Promise<any[]> {
    const departments = await this.userRepository
      .createQueryBuilder('user')
      .select('user.department', 'department')
      .addSelect('COUNT(*)', 'total')
      .where('user.tenantId = :tenantId', { tenantId })
      .andWhere('user.isActive = :isActive', { isActive: true })
      .groupBy('user.department')
      .getRawMany();

    return departments.map(dept => {
      const terminations = offboardings.filter(o => o.department === dept.department).length;
      const turnoverRate = dept.total > 0 ? (terminations / dept.total) * 100 : 0;
      return {
        department: dept.department,
        turnoverRate: Math.round(turnoverRate * 100) / 100,
        terminations,
      };
    });
  }

  private groupByReason(offboardings: any[]): any[] {
    const reasons: any = {};
    offboardings.forEach(o => {
      const reason = o.reason || 'Not specified';
      reasons[reason] = (reasons[reason] || 0) + 1;
    });

    return Object.keys(reasons).map(reason => ({
      reason,
      count: reasons[reason],
    })).sort((a, b) => b.count - a.count);
  }

  private async calculateAverageTenure(tenantId: string, offboardings: any[]): Promise<any> {
    const tenures = offboardings.map(o => {
      const start = new Date(o.startDate || o.createdAt);
      const end = new Date(o.lastWorkingDay);
      const years = (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24 * 365);
      return years;
    });

    const avgTenure = tenures.length > 0 ? tenures.reduce((sum, t) => sum + t, 0) / tenures.length : 0;

    return {
      overall: Math.round(avgTenure * 10) / 10,
      byDepartment: [], // Would calculate by department
    };
  }

  private async getAttendanceByDepartment(tenantId: string, dateRange: DateRange, records: any[]): Promise<any[]> {
    // Group attendance by department
    const departments = [...new Set(records.map(r => r.department))];
    
    return departments.map(dept => {
      const deptRecords = records.filter(r => r.department === dept);
      const present = deptRecords.filter(r => r.status === 'present' || r.status === 'late').length;
      const attendanceRate = deptRecords.length > 0 ? (present / deptRecords.length) * 100 : 0;
      const absences = deptRecords.filter(r => r.status === 'absent').length;

      return {
        department: dept,
        attendanceRate: Math.round(attendanceRate * 100) / 100,
        absences,
      };
    });
  }

  private async getLateArrivalsByDepartment(tenantId: string, dateRange: DateRange): Promise<any[]> {
    const lateRecords = await this.attendanceRepository.find({
      where: {
        tenantId,
        date: Between(dateRange.start, dateRange.end),
        status: 'late',
      },
    });

    const departments = [...new Set(lateRecords.map(r => r.department))];
    
    return departments.map(dept => ({
      department: dept,
      count: lateRecords.filter(r => r.department === dept).length,
    }));
  }

  private groupLeavesByType(leaves: any[]): any[] {
    const types: any = {};
    leaves.forEach(leave => {
      const type = leave.leaveType || 'Unknown';
      if (!types[type]) {
        types[type] = { count: 0, days: 0 };
      }
      types[type].count++;
      types[type].days += leave.numberOfDays || 0;
    });

    return Object.keys(types).map(type => ({
      type,
      count: types[type].count,
      days: types[type].days,
    }));
  }

  private async getLeaveByDepartment(tenantId: string, dateRange: DateRange, leaves: any[]): Promise<any[]> {
    const departments = [...new Set(leaves.map(l => l.department))];
    
    return departments.map(dept => {
      const deptLeaves = leaves.filter(l => l.department === dept);
      const totalDays = deptLeaves.reduce((sum, l) => sum + (l.numberOfDays || 0), 0);
      const avgDays = deptLeaves.length > 0 ? totalDays / deptLeaves.length : 0;

      return {
        department: dept,
        requests: deptLeaves.length,
        avgDays: Math.round(avgDays * 10) / 10,
      };
    });
  }

  private async getLeaveByMonth(tenantId: string, leaves: any[]): Promise<any[]> {
    const months: any = {};
    leaves.forEach(leave => {
      const month = new Date(leave.startDate).toLocaleString('default', { month: 'long' });
      months[month] = (months[month] || 0) + 1;
    });

    return Object.keys(months)
      .map(month => ({ month, count: months[month] }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 3);
  }

  private calculateWorkDays(dateRange: DateRange): number {
    let workDays = 0;
    const current = new Date(dateRange.start);
    
    while (current <= dateRange.end) {
      const day = current.getDay();
      if (day !== 0 && day !== 6) { // Not Sunday or Saturday
        workDays++;
      }
      current.setDate(current.getDate() + 1);
    }
    
    return workDays;
  }

  private async generateTurnoverTrend(tenantId: string, dateRange: DateRange): Promise<any[]> {
    // Would implement actual trend calculation
    return [];
  }

  private async generateAttendanceTrend(tenantId: string, dateRange: DateRange): Promise<any[]> {
    // Would implement actual trend calculation
    return [];
  }

  private async generateLeaveTrend(tenantId: string, dateRange: DateRange): Promise<any[]> {
    // Would implement actual trend calculation
    return [];
  }
}
