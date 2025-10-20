import { Injectable, Inject } from '@nestjs/common';
import { Repository, MoreThanOrEqual } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { LeaveRequest } from '../../leave/entities/leave-request.entity';
import { TimeEntry } from '../../time/entities/time-entry.entity';
import { Candidate } from '../../recruitment/entities/candidate.entity';

@Injectable()
export class DashboardService {
  constructor(
    @Inject('USER_REPOSITORY')
    private readonly userRepository: Repository<User>,
    @Inject('LEAVE_REQUEST_REPOSITORY')
    private readonly leaveRequestRepository: Repository<LeaveRequest>,
    @Inject('TIME_ENTRY_REPOSITORY')
    private readonly timeEntryRepository: Repository<TimeEntry>,
    @Inject('CANDIDATE_REPOSITORY')
    private readonly candidateRepository: Repository<Candidate>,
  ) {}

  /**
   * Get summary metrics for dashboard cards
   */
  async getSummaryMetrics() {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfYear = new Date(now.getFullYear(), 0, 1);

    const [
      totalEmployees,
      activeEmployees,
      newHiresThisMonth,
      pendingLeaves,
      activeRecruitments,
    ] = await Promise.all([
      this.userRepository.count(),
      this.userRepository.count({ where: { isActive: true } }),
      this.userRepository.count({
        where: {
          isActive: true,
          joinedAt: MoreThanOrEqual(startOfMonth),
        },
      }),
      this.leaveRequestRepository.count({
        where: { status: 'pending' as any },
      }),
      this.candidateRepository.count({
        where: { status: 'active' as any },
      }),
    ]);

    // Calculate attendance rate for current month
    const attendanceRate = await this.calculateAttendanceRate(startOfMonth, now);

    return {
      totalEmployees,
      activeEmployees,
      newHiresThisMonth,
      pendingLeaves,
      activeRecruitments,
      attendanceRate: Math.round(attendanceRate * 100) / 100,
      inactiveEmployees: totalEmployees - activeEmployees,
    };
  }

  /**
   * Get employee growth data for chart (last 12 months)
   */
  async getEmployeeGrowthGraph(): Promise<Array<{ month: string; employees: number; date: string }>> {
    const now = new Date();
    const monthsData: Array<{ month: string; employees: number; date: string }> = [];

    for (let i = 11; i >= 0; i--) {
      const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const nextMonth = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);

      const count = await this.userRepository.count({
        where: {
          isActive: true,
          joinedAt: MoreThanOrEqual(monthDate),
        },
      });

      monthsData.push({
        month: monthDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        employees: count,
        date: monthDate.toISOString(),
      });
    }

    return monthsData;
  }

  /**
   * Get recent activity feed
   */
  async getRecentActivity(): Promise<Array<{
    id: string;
    type: string;
    description: string;
    timestamp: Date;
    status?: string;
    user: { name: string; email?: string };
  }>> {
    const activities: Array<{
      id: string;
      type: string;
      description: string;
      timestamp: Date;
      status?: string;
      user: { name: string; email?: string };
    }> = [];

    // Get recent hires
    const recentHires = await this.userRepository.find({
      where: { isActive: true },
      order: { joinedAt: 'DESC' },
      take: 5,
      select: ['id', 'firstName', 'lastName', 'email', 'joinedAt', 'position'],
    });

    recentHires.forEach((hire) => {
      activities.push({
        id: hire.id,
        type: 'hire',
        description: `${hire.firstName} ${hire.lastName} joined as ${hire.position || 'Employee'}`,
        timestamp: hire.joinedAt,
        user: {
          name: `${hire.firstName} ${hire.lastName}`,
          email: hire.email,
        },
      });
    });

    // Get recent leave requests
    const recentLeaves = await this.leaveRequestRepository.find({
      order: { createdAt: 'DESC' },
      take: 5,
      relations: ['employee'],
    });

    recentLeaves.forEach((leave) => {
      activities.push({
        id: leave.id,
        type: 'leave',
        description: `Leave request submitted (${leave.leaveType})`,
        timestamp: leave.createdAt,
        status: leave.status,
        user: {
          name: leave.employee ? `${leave.employee.firstName} ${leave.employee.lastName}` : 'Unknown',
          email: leave.employee?.email,
        },
      });
    });

    // Sort all activities by timestamp
    return activities
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 10);
  }

  /**
   * Calculate attendance rate for a given period
   */
  private async calculateAttendanceRate(startDate: Date, endDate: Date): Promise<number> {
    const totalWorkingDays = this.getWorkingDaysBetween(startDate, endDate);
    const activeEmployees = await this.userRepository.count({ where: { isActive: true } });

    if (activeEmployees === 0 || totalWorkingDays === 0) {
      return 0;
    }

    const totalExpectedAttendance = activeEmployees * totalWorkingDays;

    // Count actual attendance (time entries)
    const actualAttendance = await this.timeEntryRepository
      .createQueryBuilder('entry')
      .where('entry.date >= :startDate', { startDate })
      .andWhere('entry.date <= :endDate', { endDate })
      .andWhere('entry.clockIn IS NOT NULL')
      .getCount();

    return totalExpectedAttendance > 0
      ? (actualAttendance / totalExpectedAttendance) * 100
      : 0;
  }

  /**
   * Calculate working days between two dates (excluding weekends)
   */
  private getWorkingDaysBetween(startDate: Date, endDate: Date): number {
    let count = 0;
    const current = new Date(startDate);

    while (current <= endDate) {
      const dayOfWeek = current.getDay();
      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        // Not Sunday (0) or Saturday (6)
        count++;
      }
      current.setDate(current.getDate() + 1);
    }

    return count;
  }

  /**
   * Get department-wise employee distribution
   */
  async getDepartmentDistribution() {
    const distribution = await this.userRepository
      .createQueryBuilder('user')
      .leftJoin('user.department', 'department')
      .select('department.name', 'departmentName')
      .addSelect('COUNT(user.id)', 'count')
      .where('user.isActive = :isActive', { isActive: true })
      .groupBy('department.name')
      .getRawMany();

    return distribution.map((item) => ({
      department: item.departmentName || 'Unassigned',
      count: parseInt(item.count, 10),
    }));
  }

  /**
   * Get payroll summary for current month
   */
  async getPayrollSummary() {
    // This is a placeholder - implement based on your payroll structure
    return {
      totalPayroll: 0,
      pendingPayments: 0,
      processedPayments: 0,
      averageSalary: 0,
    };
  }
}
