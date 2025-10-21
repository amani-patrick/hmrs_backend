import { Injectable, Inject } from '@nestjs/common';
import { Repository, Between, MoreThanOrEqual, LessThanOrEqual } from 'typeorm';
import { DashboardWidget } from './entities/dashboard-widget.entity';
import { AnalyticsQueryDto, TimeRange } from './dto/analytics-query.dto';

interface DateRange {
  start: Date;
  end: Date;
}

@Injectable()
export class AnalyticsService {
  constructor(
    @Inject('DASHBOARD_WIDGET_REPOSITORY')
    private readonly widgetRepository: Repository<DashboardWidget>,
  ) {}

  // ==================== HEADCOUNT ANALYTICS ====================

  async getHeadcountMetrics(tenantId: string, query: AnalyticsQueryDto) {
    const dateRange = this.getDateRange(query);
    
    // TODO: Integrate with actual employee repository
    return {
      current: 150,
      previousPeriod: 145,
      change: 5,
      changePercent: 3.45,
      byDepartment: [
        { department: 'Engineering', count: 50, change: 2 },
        { department: 'Sales', count: 40, change: 3 },
        { department: 'HR', count: 15, change: 0 },
        { department: 'Finance', count: 20, change: 0 },
        { department: 'Operations', count: 25, change: 0 },
      ],
      byPosition: [
        { position: 'Software Engineer', count: 35, change: 2 },
        { position: 'Sales Representative', count: 30, change: 3 },
        { position: 'Manager', count: 20, change: 0 },
      ],
      trend: this.generateTrendData(dateRange, 'headcount'),
    };
  }

  // ==================== TURNOVER & RETENTION ====================

  async getTurnoverMetrics(tenantId: string, query: AnalyticsQueryDto) {
    const dateRange = this.getDateRange(query);
    
    return {
      turnoverRate: 12.5, // percentage
      voluntaryTurnover: 8.5,
      involuntaryTurnover: 4.0,
      retentionRate: 87.5,
      newHires: 15,
      terminations: 10,
      byDepartment: [
        { department: 'Sales', turnoverRate: 18.0, terminations: 5 },
        { department: 'Engineering', turnoverRate: 8.0, terminations: 3 },
        { department: 'Operations', turnoverRate: 12.0, terminations: 2 },
      ],
      reasonsForLeaving: [
        { reason: 'Better Opportunity', count: 4 },
        { reason: 'Relocation', count: 2 },
        { reason: 'Career Change', count: 1 },
        { reason: 'Retirement', count: 1 },
        { reason: 'Performance', count: 2 },
      ],
      averageTenure: {
        overall: 3.2, // years
        byDepartment: [
          { department: 'Engineering', tenure: 3.8 },
          { department: 'Sales', tenure: 2.5 },
          { department: 'HR', tenure: 4.5 },
        ],
      },
      trend: this.generateTrendData(dateRange, 'turnover'),
    };
  }

  // ==================== ATTENDANCE ANALYTICS ====================

  async getAttendanceMetrics(tenantId: string, query: AnalyticsQueryDto) {
    const dateRange = this.getDateRange(query);
    
    return {
      averageAttendanceRate: 96.5, // percentage
      totalWorkDays: 22,
      totalAbsences: 45,
      averageHoursPerDay: 8.2,
      overtimeHours: 120,
      byDepartment: [
        { department: 'Engineering', attendanceRate: 97.5, absences: 8 },
        { department: 'Sales', attendanceRate: 95.0, absences: 15 },
        { department: 'Operations', attendanceRate: 98.0, absences: 5 },
      ],
      lateArrivals: {
        total: 28,
        byDepartment: [
          { department: 'Engineering', count: 10 },
          { department: 'Sales', count: 12 },
          { department: 'Operations', count: 6 },
        ],
      },
      earlyDepartures: {
        total: 15,
        average: 0.68, // per employee
      },
      trend: this.generateTrendData(dateRange, 'attendance'),
    };
  }

  // ==================== LEAVE ANALYTICS ====================

  async getLeaveMetrics(tenantId: string, query: AnalyticsQueryDto) {
    const dateRange = this.getDateRange(query);
    
    return {
      totalLeaveRequests: 85,
      approvedLeaves: 78,
      pendingLeaves: 5,
      rejectedLeaves: 2,
      approvalRate: 91.8,
      byLeaveType: [
        { type: 'Annual Leave', count: 45, days: 180 },
        { type: 'Sick Leave', count: 25, days: 60 },
        { type: 'Personal Leave', count: 10, days: 25 },
        { type: 'Maternity Leave', count: 3, days: 270 },
        { type: 'Unpaid Leave', count: 2, days: 15 },
      ],
      byDepartment: [
        { department: 'Engineering', requests: 30, avgDays: 5.5 },
        { department: 'Sales', requests: 28, avgDays: 4.8 },
        { department: 'Operations', requests: 15, avgDays: 5.2 },
      ],
      peakMonths: [
        { month: 'December', count: 35 },
        { month: 'July', count: 28 },
        { month: 'April', count: 22 },
      ],
      averageLeaveBalance: 12.5, // days
      utilizationRate: 68.5, // percentage
      trend: this.generateTrendData(dateRange, 'leave'),
    };
  }

  // ==================== PERFORMANCE ANALYTICS ====================

  async getPerformanceMetrics(tenantId: string, query: AnalyticsQueryDto) {
    const dateRange = this.getDateRange(query);
    
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
      byDepartment: [
        { department: 'Engineering', avgRating: 4.0, reviews: 50 },
        { department: 'Sales', avgRating: 3.7, reviews: 40 },
        { department: 'Operations', avgRating: 3.6, reviews: 25 },
      ],
      goalCompletion: {
        total: 450,
        completed: 380,
        inProgress: 50,
        notStarted: 20,
        completionRate: 84.4,
      },
      topPerformers: [
        { employeeId: '1', name: 'John Doe', rating: 4.9, department: 'Engineering' },
        { employeeId: '2', name: 'Jane Smith', rating: 4.8, department: 'Sales' },
        { employeeId: '3', name: 'Bob Johnson', rating: 4.7, department: 'Operations' },
      ],
      trend: this.generateTrendData(dateRange, 'performance'),
    };
  }

  // ==================== TRAINING ANALYTICS ====================

  async getTrainingMetrics(tenantId: string, query: AnalyticsQueryDto) {
    const dateRange = this.getDateRange(query);
    
    return {
      totalPrograms: 45,
      activePrograms: 30,
      totalEnrollments: 520,
      completedEnrollments: 380,
      completionRate: 73.1,
      averageScore: 85.5,
      byCategory: [
        { category: 'Technical Skills', programs: 15, enrollments: 200, completion: 78.0 },
        { category: 'Soft Skills', programs: 12, enrollments: 150, completion: 82.0 },
        { category: 'Compliance', programs: 10, enrollments: 120, completion: 95.0 },
        { category: 'Leadership', programs: 8, enrollments: 50, completion: 72.0 },
      ],
      byDepartment: [
        { department: 'Engineering', enrollments: 180, avgScore: 88.0 },
        { department: 'Sales', enrollments: 150, avgScore: 84.0 },
        { department: 'Operations', enrollments: 100, avgScore: 86.0 },
      ],
      certificationsEarned: 85,
      trainingHours: 2400,
      averageHoursPerEmployee: 16,
      roi: {
        totalCost: 50000,
        estimatedValue: 150000,
        roiPercentage: 200,
      },
      trend: this.generateTrendData(dateRange, 'training'),
    };
  }

  // ==================== PAYROLL ANALYTICS ====================

  async getPayrollMetrics(tenantId: string, query: AnalyticsQueryDto) {
    const dateRange = this.getDateRange(query);
    
    return {
      totalPayrollExpense: 1250000,
      averageSalary: 8333,
      medianSalary: 7500,
      totalBonuses: 125000,
      totalDeductions: 187500,
      netPayroll: 1187500,
      byDepartment: [
        { department: 'Engineering', expense: 450000, employees: 50, avgSalary: 9000 },
        { department: 'Sales', expense: 380000, employees: 40, avgSalary: 9500 },
        { department: 'Operations', expense: 200000, employees: 25, avgSalary: 8000 },
        { department: 'HR', expense: 120000, employees: 15, avgSalary: 8000 },
        { department: 'Finance', expense: 100000, employees: 20, avgSalary: 5000 },
      ],
      salaryBands: [
        { range: '$0-25K', count: 20, percentage: 13.3 },
        { range: '$25K-50K', count: 60, percentage: 40.0 },
        { range: '$50K-75K', count: 45, percentage: 30.0 },
        { range: '$75K-100K', count: 20, percentage: 13.3 },
        { range: '$100K+', count: 5, percentage: 3.4 },
      ],
      overtimeCost: 35000,
      benefitsCost: 187500,
      taxWithheld: 250000,
      trend: this.generateTrendData(dateRange, 'payroll'),
    };
  }

  // ==================== RECRUITMENT ANALYTICS ====================

  async getRecruitmentMetrics(tenantId: string, query: AnalyticsQueryDto) {
    const dateRange = this.getDateRange(query);
    
    return {
      totalApplications: 450,
      openPositions: 25,
      closedPositions: 15,
      hires: 12,
      rejections: 320,
      inProgress: 118,
      timeToHire: {
        average: 32, // days
        median: 28,
        byDepartment: [
          { department: 'Engineering', days: 38 },
          { department: 'Sales', days: 25 },
          { department: 'Operations', days: 30 },
        ],
      },
      costPerHire: {
        average: 4200,
        total: 50400,
      },
      sourceEffectiveness: [
        { source: 'LinkedIn', applications: 180, hires: 5, costPerHire: 5000 },
        { source: 'Indeed', applications: 120, hires: 3, costPerHire: 3500 },
        { source: 'Referrals', applications: 80, hires: 4, costPerHire: 2000 },
        { source: 'Company Website', applications: 70, hires: 0, costPerHire: 0 },
      ],
      conversionRates: {
        applicationToInterview: 26.2,
        interviewToOffer: 15.3,
        offerToHire: 80.0,
      },
      offerAcceptanceRate: 80.0,
      trend: this.generateTrendData(dateRange, 'recruitment'),
    };
  }

  // ==================== COMPARATIVE ANALYTICS ====================

  async getComparativeAnalytics(tenantId: string, query: AnalyticsQueryDto) {
    return {
      yearOverYear: {
        headcount: { current: 150, previous: 140, change: 7.1 },
        turnoverRate: { current: 12.5, previous: 15.0, change: -16.7 },
        avgSalary: { current: 8333, previous: 7850, change: 6.2 },
        trainingHours: { current: 2400, previous: 2100, change: 14.3 },
      },
      monthOverMonth: {
        newHires: { current: 5, previous: 8, change: -37.5 },
        absences: { current: 45, previous: 52, change: -13.5 },
        overtimeHours: { current: 120, previous: 135, change: -11.1 },
      },
      benchmarks: {
        turnoverRate: { company: 12.5, industry: 15.0, difference: -2.5 },
        attendanceRate: { company: 96.5, industry: 94.0, difference: 2.5 },
        trainingHours: { company: 16, industry: 12, difference: 4 },
      },
    };
  }

  // ==================== PREDICTIVE ANALYTICS ====================

  async getPredictiveAnalytics(tenantId: string) {
    return {
      attritionRisk: [
        { employeeId: '1', name: 'Employee A', risk: 0.78, factors: ['Low engagement', 'No promotion'] },
        { employeeId: '2', name: 'Employee B', risk: 0.65, factors: ['High overtime', 'Low satisfaction'] },
      ],
      hiringNeeds: {
        next30Days: 5,
        next60Days: 10,
        next90Days: 15,
        byDepartment: [
          { department: 'Engineering', positions: 6 },
          { department: 'Sales', positions: 4 },
        ],
      },
      budgetForecast: {
        nextQuarter: 3850000,
        nextYear: 15800000,
        breakdown: [
          { category: 'Salaries', amount: 12000000 },
          { category: 'Benefits', amount: 2400000 },
          { category: 'Training', amount: 600000 },
          { category: 'Recruitment', amount: 800000 },
        ],
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
      case TimeRange.LAST_WEEK:
        start = new Date(now.setDate(now.getDate() - now.getDay() - 7));
        start.setHours(0, 0, 0, 0);
        end = new Date(start);
        end.setDate(end.getDate() + 6);
        end.setHours(23, 59, 59, 999);
        break;
      case TimeRange.THIS_MONTH:
        start = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case TimeRange.LAST_MONTH:
        start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        end = new Date(now.getFullYear(), now.getMonth(), 0);
        break;
      case TimeRange.THIS_QUARTER:
        const quarter = Math.floor(now.getMonth() / 3);
        start = new Date(now.getFullYear(), quarter * 3, 1);
        break;
      case TimeRange.THIS_YEAR:
        start = new Date(now.getFullYear(), 0, 1);
        break;
      case TimeRange.LAST_YEAR:
        start = new Date(now.getFullYear() - 1, 0, 1);
        end = new Date(now.getFullYear() - 1, 11, 31);
        break;
      default:
        start = new Date(now.getFullYear(), now.getMonth(), 1);
    }

    return { start, end };
  }

  private generateTrendData(dateRange: DateRange, metric: string): any[] {
    // Mock trend data generation
    const days = Math.ceil((dateRange.end.getTime() - dateRange.start.getTime()) / (1000 * 60 * 60 * 24));
    const points = Math.min(days, 30);
    const trend: Array<{ date: string; value: number }> = [];

    for (let i = 0; i < points; i++) {
      const date = new Date(dateRange.start);
      date.setDate(date.getDate() + Math.floor((i / points) * days));
      
      trend.push({
        date: date.toISOString().split('T')[0],
        value: Math.floor(Math.random() * 100) + 50,
      });
    }

    return trend;
  }
}
