import { Injectable, Inject } from '@nestjs/common';
import { Repository, Between, MoreThanOrEqual, LessThanOrEqual, In } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { LeaveRequest, LeaveStatus } from '../leave/entities/leave-request.entity';
import { AttendanceRecord, AttendanceStatus } from '../attendance/entities/attendance-record.entity';
import { PerformanceReview, ReviewStatus } from '../performance/entities/performance-review.entity';
import { Goal, GoalStatus } from '../performance/entities/goal.entity';
import { Enrollment, EnrollmentStatus } from '../training/entities/enrollment.entity';

@Injectable()
export class ManagerDashboardRealService {
  constructor(
    @Inject('USER_REPOSITORY')
    private readonly userRepository: Repository<User>,
    @Inject('LEAVE_REQUEST_REPOSITORY')
    private readonly leaveRepository: Repository<LeaveRequest>,
    @Inject('ATTENDANCE_RECORD_REPOSITORY')
    private readonly attendanceRepository: Repository<AttendanceRecord>,
    @Inject('PERFORMANCE_REVIEW_REPOSITORY')
    private readonly reviewRepository: Repository<PerformanceReview>,
    @Inject('GOAL_REPOSITORY')
    private readonly goalRepository: Repository<Goal>,
    @Inject('ENROLLMENT_REPOSITORY')
    private readonly enrollmentRepository: Repository<Enrollment>,
  ) {}

  // ==================== TEAM OVERVIEW ====================

  async getTeamOverview(tenantId: string, managerId: string) {
    const teamMembers = await this.userRepository.find({
      where: { tenantId, managerId, isActive: true },
      relations: ['department', 'positionRef'],
    });

    const onLeave = await this.leaveRepository.count({
      where: {
        tenantId,
        employeeId: In(teamMembers.map(m => m.id)),
        status: LeaveStatus.APPROVED,
        startDate: LessThanOrEqual(new Date()),
        endDate: MoreThanOrEqual(new Date()),
      },
    });

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const newHires = await this.userRepository.count({
      where: {
        tenantId,
        joinedAt: MoreThanOrEqual(thirtyDaysAgo),
      },
    });

    const probationPeriod = teamMembers.filter(m => {
      if (!m.joinedAt) return false;
      const daysSinceHire = Math.floor((new Date().getTime() - new Date(m.joinedAt).getTime()) / (1000 * 60 * 60 * 24));
      return daysSinceHire < 90;
    }).length;

    const departmentBreakdown = teamMembers.reduce((acc, member) => {
      const deptName = member.department?.name || 'Unassigned';
      const existing = acc.find(d => d.department === deptName);
      if (existing) {
        existing.count++;
      } else {
        acc.push({ department: deptName, count: 1 });
      }
      return acc;
    }, [] as Array<{ department: string; count: number }>);

    const recentJoiners = teamMembers
      .filter(m => m.joinedAt)
      .sort((a, b) => new Date(b.joinedAt!).getTime() - new Date(a.joinedAt!).getTime())
      .slice(0, 5)
      .map(m => ({
        id: m.id,
        name: `${m.firstName} ${m.lastName}`,
        position: m.positionRef?.title || m.position || 'N/A',
        joinDate: m.joinedAt,
      }));

    return {
      teamSize: teamMembers.length,
      activeMembers: teamMembers.length - onLeave,
      onLeave,
      newHires,
      probationPeriod,
      departmentBreakdown,
      recentJoiners,
    };
  }

  // ==================== QUICK ACTIONS ====================

  async getPendingActions(tenantId: string, managerId: string) {
    const teamMembers = await this.userRepository.find({
      where: { tenantId, managerId, isActive: true },
      select: ['id'],
    });
    const teamMemberIds = teamMembers.map(m => m.id);

    const pendingLeaveRequests = await this.leaveRepository.count({
      where: { tenantId, employeeId: In(teamMemberIds), status: LeaveStatus.PENDING },
    });

    const upcomingReviews = await this.reviewRepository.count({
      where: {
        tenantId,
        employeeId: In(teamMemberIds),
        status: ReviewStatus.IN_PROGRESS,
        dueDate: MoreThanOrEqual(new Date()),
      },
    });

    const overdueGoals = await this.goalRepository.count({
      where: {
        tenantId,
        ownerId: In(teamMemberIds),
        status: GoalStatus.ACTIVE,
        dueDate: LessThanOrEqual(new Date()),
      },
    });

    const trainingApprovals = await this.enrollmentRepository.count({
      where: {
        tenantId,
        learnerId: In(teamMemberIds),
        status: EnrollmentStatus.ENROLLED,
      },
    });

    const total = pendingLeaveRequests + upcomingReviews + overdueGoals + trainingApprovals;

    return {
      pendingLeaveRequests,
      pendingTimeoffs: 0, // TODO: Add timeoff entity
      pendingReimbursements: 0, // TODO: Add reimbursement entity
      upcomingReviews,
      overdueGoals,
      trainingApprovals,
      total,
    };
  }

  // ==================== TIME-OFF REQUESTS ====================

  async getTimeoffRequests(tenantId: string, managerId: string) {
    // Get team members
    const teamMembers = await this.userRepository.find({
      where: { tenantId, managerId, isActive: true },
      select: ['id'],
    });

    if (teamMembers.length === 0) {
      return [];
    }

    const teamMemberIds = teamMembers.map(member => member.id);

    // Get pending time-off requests for team members
    const timeoffRequests = await this.leaveRepository.find({
      where: {
        tenantId,
        employeeId: In(teamMemberIds),
        status: LeaveStatus.PENDING,
      },
      relations: ['employee'],
      order: { createdAt: 'DESC' },
    });

    return timeoffRequests.map(request => ({
      id: request.id,
      type: typeof request.leaveType === 'string' ? request.leaveType : 'N/A',
      startDate: request.startDate,
      endDate: request.endDate,
      status: request.status,
      reason: request.reason,
      employee: {
        id: request.employee.id,
        name: `${request.employee.firstName} ${request.employee.lastName}`,
        avatar: request.employee.profilePictureUrl,
      },
      submittedAt: request.createdAt,
    }));
  }

  // ==================== LEAVE REQUESTS ====================

  async getLeaveRequests(tenantId: string, managerId: string) {
    const teamMembers = await this.userRepository.find({
      where: { tenantId, managerId, isActive: true },
      select: ['id'],
    });

    const requests = await this.leaveRepository.find({
      where: {
        tenantId,
        employeeId: In(teamMembers.map(m => m.id)),
        status: LeaveStatus.PENDING,
      },
      relations: ['employee', 'leaveType'],
      order: { createdAt: 'DESC' },
      take: 20,
    });

    return requests.map(req => ({
      id: req.id,
      employeeName: `${req.employee.firstName} ${req.employee.lastName}`,
      leaveType: typeof req.leaveType === 'string' ? req.leaveType : 'N/A',
      startDate: req.startDate,
      endDate: req.endDate,
      days: req.daysRequested,
      status: req.status,
      reason: req.reason,
    }));
  }

  // ==================== TEAM CALENDAR ====================

  async getTeamCalendar(tenantId: string, managerId: string, startDate: string, endDate: string) {
    // Get team members
    const teamMembers = await this.userRepository.find({
      where: { tenantId, managerId, isActive: true },
      select: ['id', 'firstName', 'lastName', 'profilePictureUrl'],
    });

    if (teamMembers.length === 0) {
      return [];
    }

    const teamMemberIds = teamMembers.map(member => member.id);
    const start = new Date(startDate);
    const end = new Date(endDate);

    // Get leave requests for team members within date range
    const leaveRequests = await this.leaveRepository.find({
      where: {
        tenantId,
        employeeId: In(teamMemberIds),
        startDate: Between(start, end),
        status: In(['APPROVED', 'PENDING']),
      },
      relations: ['employee'],
    });

    // Get attendance records for team members within date range
    const attendanceRecords = await this.attendanceRepository.find({
      where: {
        tenantId,
        employeeId: In(teamMemberIds),
        date: Between(start, end),
      },
    });

    // Format the data for the calendar
    const events = [
      ...leaveRequests.map(request => ({
        id: `leave-${request.id}`,
        type: 'leave',
        title: `${request.employee.firstName} ${request.employee.lastName} - ${typeof request.leaveType === 'string' ? request.leaveType : 'Leave'}`,
        start: request.startDate,
        end: request.endDate,
        status: request.status,
        userId: request.employeeId,
        userName: `${request.employee.firstName} ${request.employee.lastName}`,
        userAvatar: request.employee.profilePictureUrl,
      })),
      ...attendanceRecords.map(record => {
        const employee = teamMembers.find(m => m.id === record.employeeId);
        return {
          id: `attendance-${record.id}`,
          type: 'attendance',
          title: `${employee?.firstName || 'Unknown'} ${employee?.lastName || ''} - ${record.status}`,
          start: new Date(record.date),
          end: new Date(record.date),
          status: record.status,
          checkIn: record.checkInTime,
          checkOut: record.checkOutTime,
          userId: record.employeeId,
          userName: `${employee?.firstName || 'Unknown'} ${employee?.lastName || ''}`,
          userAvatar: employee?.profilePictureUrl,
        };
      }),
    ];

    return events;
  }

  // ==================== TEAM PERFORMANCE ====================

  async getTeamPerformance(tenantId: string, managerId: string) {
    const teamMembers = await this.userRepository.find({
      where: { tenantId, managerId, isActive: true },
    });
    const teamMemberIds = teamMembers.map(m => m.id);

    const reviews = await this.reviewRepository.find({
      where: {
        tenantId,
        employeeId: In(teamMemberIds),
        status: ReviewStatus.COMPLETED,
      },
      relations: ['employee'],
    });

    const averageRating = reviews.length > 0
      ? reviews.reduce((sum, r) => sum + (typeof r.overallRating === 'number' ? r.overallRating : 0), 0) / reviews.length
      : 0;

    const goals = await this.goalRepository.find({
      where: { tenantId, ownerId: In(teamMemberIds) },
    });

    const goalsCompleted = goals.filter(g => g.status === GoalStatus.COMPLETED).length;
    const goalsTotal = goals.length;
    const completionRate = goalsTotal > 0 ? (goalsCompleted / goalsTotal) * 100 : 0;

    const performanceByMember = teamMembers.map(member => {
      const memberReviews = reviews.filter(r => r.employeeId === member.id);
      const memberGoals = goals.filter(g => g.ownerId === member.id);
      const avgRating = memberReviews.length > 0
        ? memberReviews.reduce((sum, r) => sum + (typeof r.overallRating === 'number' ? r.overallRating : 0), 0) / memberReviews.length
        : 0;
      const completedGoals = memberGoals.filter(g => g.status === GoalStatus.COMPLETED).length;

      return {
        id: member.id,
        name: `${member.firstName} ${member.lastName}`,
        rating: avgRating,
        goalsCompleted: completedGoals,
        overdueGoals: memberGoals.filter(g => g.status === GoalStatus.ACTIVE && g.dueDate && new Date(g.dueDate) < new Date()).length,
      };
    });

    const topPerformers = performanceByMember
      .filter(p => p.rating > 0)
      .sort((a, b) => b.rating - a.rating)
      .slice(0, 3);

    const needsAttention = performanceByMember
      .filter(p => p.rating > 0 && p.rating < 3.5 || p.overdueGoals > 2)
      .slice(0, 5);

    return {
      averageRating: Math.round(averageRating * 10) / 10,
      goalsCompleted,
      goalsTotal,
      completionRate: Math.round(completionRate),
      topPerformers,
      needsAttention,
    };
  }

//getTeamAttendanceSummary
  async getTeamAttendanceSummary(tenantId: string, managerId: string, month: string) {
    const teamMembers = await this.userRepository.find({
      where: { tenantId, managerId, isActive: true },
    });
    const teamMemberIds = teamMembers.map(m => m.id);

    const attendance = await this.attendanceRepository.find({
      where: {
        tenantId,
        employeeId: In(teamMemberIds),
        date: MoreThanOrEqual(new Date(month)),
      },
      relations: ['employee'],
    });

    const total = attendance.length;
    const present = attendance.filter(a => a.status === AttendanceStatus.PRESENT).length;
    const absent = attendance.filter(a => a.status === AttendanceStatus.ABSENT).length;
    const late = attendance.filter(a => a.status === AttendanceStatus.LATE).length;
    const onLeave = attendance.filter(a => a.status === AttendanceStatus.ON_LEAVE).length;

    return {
      total,
      present,
      absent,
      late,
      onLeave,
    };
  }


  async getTeamGoals(tenantId: string, managerId: string) {
    const teamMembers = await this.userRepository.find({
      where: { tenantId, managerId, isActive: true },
    });

    const goals = await this.goalRepository.find({
      where: {
        tenantId,
        ownerId: In(teamMembers.map(m => m.id)),
      },
      relations: ['owner'],
    });

    const total = goals.length;
    const completed = goals.filter(g => g.status === GoalStatus.COMPLETED).length;
    const inProgress = goals.filter(g => g.status === GoalStatus.ACTIVE || g.status === GoalStatus.ON_TRACK).length;
    const notStarted = goals.filter(g => g.status === GoalStatus.DRAFT).length;
    const overdue = goals.filter(g => 
      (g.status === GoalStatus.ACTIVE || g.status === GoalStatus.BEHIND) && 
      g.dueDate && 
      new Date(g.dueDate) < new Date()
    ).length;

    const byMember = teamMembers.map(member => {
      const memberGoals = goals.filter(g => g.ownerId === member.id);
      return {
        memberId: member.id,
        memberName: `${member.firstName} ${member.lastName}`,
        total: memberGoals.length,
        completed: memberGoals.filter(g => g.status === GoalStatus.COMPLETED).length,
      };
    });

    return {
      total,
      completed,
      inProgress,
      notStarted,
      overdue,
      byMember,
    };
  }

  // ==================== TEAM ATTENDANCE ====================

  async getTeamAttendance(tenantId: string, managerId: string, date?: string) {
    const targetDate = date ? new Date(date) : new Date();
    const startOfDay = new Date(targetDate.setHours(0, 0, 0, 0));
    const endOfDay = new Date(targetDate.setHours(23, 59, 59, 999));

    const teamMembers = await this.userRepository.find({
      where: { tenantId, managerId, isActive: true },
    });

    const attendance = await this.attendanceRepository.find({
      where: {
        tenantId,
        employeeId: In(teamMembers.map(m => m.id)),
        date: Between(startOfDay, endOfDay),
      },
      relations: ['employee'],
    });

    const onLeave = await this.leaveRepository.count({
      where: {
        tenantId,
        employeeId: In(teamMembers.map(m => m.id)),
        status: LeaveStatus.APPROVED,
        startDate: LessThanOrEqual(targetDate),
        endDate: MoreThanOrEqual(targetDate),
      },
    });

    const present = attendance.filter(a => a.status === 'present').length;
    const late = attendance.filter(a => a.status === 'late').length;
    const workFromHome = attendance.filter(a => a.checkInLocation?.includes('remote') || a.checkInLocation?.includes('home')).length;
    const absent = teamMembers.length - attendance.length - onLeave;

    const members = teamMembers.map(member => {
      const record = attendance.find(a => a.employeeId === member.id);
      const isOnLeave = onLeave > 0; // Simplified - should check specific member

      return {
        id: member.id,
        name: `${member.firstName} ${member.lastName}`,
        status: isOnLeave ? 'on_leave' : (record?.status || 'absent'),
        checkIn: record?.checkInTime || null,
        checkOut: record?.checkOutTime || null,
      };
    });

    return {
      date: startOfDay.toISOString().split('T')[0],
      present,
      absent,
      onLeave,
      late,
      workFromHome,
      members,
    };
  }

  async getQuickStats(tenantId: string, managerId: string) {
    const overview = await this.getTeamOverview(tenantId, managerId);
    const actions = await this.getPendingActions(tenantId, managerId);
    const performance = await this.getTeamPerformance(tenantId, managerId);
    const attendance = await this.getTeamAttendance(tenantId, managerId);

    return {
      teamSize: overview.teamSize,
      presentToday: attendance.present,
      onLeaveToday: attendance.onLeave,
      pendingApprovals: actions.pendingLeaveRequests,
      overdueGoals: actions.overdueGoals,
      upcomingReviews: actions.upcomingReviews,
      avgTeamRating: performance.averageRating,
      teamAttendanceRate: attendance.present > 0 ? (attendance.present / overview.teamSize) * 100 : 0,
    };
  }

  //getTeamTraining
  async getTeamTraining(tenantId: string, managerId: string) {
    const teamMembers = await this.userRepository.find({
      where: { tenantId, managerId, isActive: true },
    });
    const teamMemberIds = teamMembers.map(m => m.id);

    const training = await this.enrollmentRepository.find({
      where: {
        tenantId,
        learnerId: In(teamMemberIds),
        status: EnrollmentStatus.ENROLLED,
      },
      relations: ['learner'],
    });

    const total = training.length;
    const completed = training.filter(t => t.status === EnrollmentStatus.COMPLETED).length;
    const inProgress = training.filter(t => t.status === EnrollmentStatus.ENROLLED).length;
    const notStarted = training.filter(t => t.status === EnrollmentStatus.ENROLLED).length;

    const byMember = teamMembers.map(member => {
      const memberTraining = training.filter(t => t.learnerId === member.id);
      return {
        memberId: member.id,
        memberName: `${member.firstName} ${member.lastName}`,
        total: memberTraining.length,
        completed: memberTraining.filter(t => t.status === EnrollmentStatus.COMPLETED).length,
      };
    });

    return {
      total,
      completed,
      inProgress,
      notStarted,
      byMember,
    };
  }
}
