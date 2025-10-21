import { Injectable } from '@nestjs/common';

@Injectable()
export class ManagerDashboardService {
  // ==================== TEAM OVERVIEW ====================

  async getTeamOverview(tenantId: string, managerId: string) {
    // Mock data - would integrate with actual repositories
    return {
      teamSize: 12,
      activeMembers: 11,
      onLeave: 1,
      newHires: 2,
      probationPeriod: 1,
      departmentBreakdown: [
        { department: 'Engineering', count: 8 },
        { department: 'Design', count: 4 },
      ],
      recentJoiners: [
        { id: '1', name: 'John Doe', position: 'Developer', joinDate: '2025-10-15' },
        { id: '2', name: 'Jane Smith', position: 'Designer', joinDate: '2025-10-10' },
      ],
    };
  }

  // ==================== QUICK ACTIONS ====================

  async getPendingActions(tenantId: string, managerId: string) {
    return {
      pendingLeaveRequests: 3,
      pendingTimeoffs: 2,
      pendingReimbursements: 1,
      upcomingReviews: 4,
      overdueGoals: 2,
      trainingApprovals: 1,
      total: 13,
    };
  }

  async getLeaveRequests(tenantId: string, managerId: string) {
    // Mock data
    return [
      {
        id: '1',
        employeeName: 'John Doe',
        leaveType: 'Annual Leave',
        startDate: '2025-11-05',
        endDate: '2025-11-07',
        days: 3,
        status: 'pending',
        reason: 'Family vacation',
      },
      {
        id: '2',
        employeeName: 'Jane Smith',
        leaveType: 'Sick Leave',
        startDate: '2025-10-25',
        endDate: '2025-10-25',
        days: 1,
        status: 'pending',
        reason: 'Medical appointment',
      },
    ];
  }

  async getTimeoffRequests(tenantId: string, managerId: string) {
    return [
      {
        id: '1',
        employeeName: 'Bob Johnson',
        date: '2025-10-30',
        hours: 4,
        reason: 'Personal appointment',
        status: 'pending',
      },
    ];
  }

  // ==================== TEAM PERFORMANCE ====================

  async getTeamPerformance(tenantId: string, managerId: string) {
    return {
      averageRating: 4.2,
      goalsCompleted: 78,
      goalsTotal: 100,
      completionRate: 78,
      topPerformers: [
        { id: '1', name: 'Alice Brown', rating: 4.8, goalsCompleted: 15 },
        { id: '2', name: 'Charlie Davis', rating: 4.6, goalsCompleted: 14 },
        { id: '3', name: 'Diana Evans', rating: 4.5, goalsCompleted: 13 },
      ],
      needsAttention: [
        { id: '4', name: 'Frank Green', rating: 3.2, overdueGoals: 3 },
      ],
    };
  }

  async getTeamGoals(tenantId: string, managerId: string) {
    return {
      total: 100,
      completed: 78,
      inProgress: 18,
      notStarted: 4,
      overdue: 2,
      byMember: [
        { memberId: '1', memberName: 'Alice Brown', total: 10, completed: 9 },
        { memberId: '2', memberName: 'Bob Johnson', total: 8, completed: 6 },
      ],
    };
  }

  // ==================== TEAM ATTENDANCE ====================

  async getTeamAttendance(tenantId: string, managerId: string, date?: string) {
    return {
      date: date || new Date().toISOString().split('T')[0],
      present: 10,
      absent: 1,
      onLeave: 1,
      late: 2,
      workFromHome: 3,
      members: [
        { id: '1', name: 'John Doe', status: 'present', checkIn: '09:00', checkOut: null },
        { id: '2', name: 'Jane Smith', status: 'late', checkIn: '09:45', checkOut: null },
        { id: '3', name: 'Bob Johnson', status: 'on_leave', checkIn: null, checkOut: null },
      ],
    };
  }

  async getTeamAttendanceSummary(tenantId: string, managerId: string, month: string) {
    return {
      month,
      averageAttendanceRate: 96.5,
      totalWorkDays: 22,
      totalAbsences: 12,
      lateArrivals: 8,
      overtimeHours: 45,
      byMember: [
        { memberId: '1', memberName: 'John Doe', attendanceRate: 98, absences: 0, lateCount: 1 },
        { memberId: '2', memberName: 'Jane Smith', attendanceRate: 95, absences: 1, lateCount: 2 },
      ],
    };
  }

  // ==================== TEAM CALENDAR ====================

  async getTeamCalendar(tenantId: string, managerId: string, startDate: string, endDate: string) {
    return {
      period: { startDate, endDate },
      upcomingLeaves: [
        { memberId: '1', memberName: 'John Doe', startDate: '2025-11-05', endDate: '2025-11-07', type: 'Annual Leave' },
        { memberId: '2', memberName: 'Jane Smith', startDate: '2025-11-10', endDate: '2025-11-12', type: 'Personal Leave' },
      ],
      teamEvents: [
        { id: '1', title: 'Team Meeting', date: '2025-10-25', time: '10:00', attendees: 12 },
        { id: '2', title: 'Sprint Planning', date: '2025-10-28', time: '14:00', attendees: 8 },
      ],
      birthdays: [
        { memberId: '3', memberName: 'Bob Johnson', date: '2025-10-30' },
      ],
      anniversaries: [
        { memberId: '4', memberName: 'Alice Brown', date: '2025-11-01', years: 3 },
      ],
    };
  }

  // ==================== TEAM TRAINING ====================

  async getTeamTraining(tenantId: string, managerId: string) {
    return {
      activePrograms: 5,
      totalEnrollments: 18,
      completedCourses: 12,
      averageProgress: 67,
      upcomingDeadlines: [
        { memberId: '1', memberName: 'John Doe', courseName: 'Advanced React', deadline: '2025-11-15', progress: 80 },
        { memberId: '2', memberName: 'Jane Smith', courseName: 'Leadership 101', deadline: '2025-11-20', progress: 45 },
      ],
      pendingApprovals: [
        { memberId: '3', memberName: 'Bob Johnson', courseName: 'AWS Certification Prep', requestedDate: '2025-10-18' },
      ],
    };
  }

  // ==================== QUICK STATS ====================

  async getQuickStats(tenantId: string, managerId: string) {
    return {
      teamSize: 12,
      presentToday: 10,
      onLeaveToday: 1,
      pendingApprovals: 6,
      overdueGoals: 2,
      upcomingReviews: 4,
      avgTeamRating: 4.2,
      teamAttendanceRate: 96.5,
    };
  }
}
