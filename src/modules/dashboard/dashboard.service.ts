import { Injectable } from '@nestjs/common';

interface DashboardStats {
  value: string | number;
  label: string;
  change?: string;
  changeType?: 'increase' | 'decrease';
  icon?: string;
}

@Injectable()
export class DashboardService {
  
  // ==================== MANAGER DASHBOARD ====================

  async getManagerDashboard(tenantId: string, managerId: string): Promise<{
    teamStats: DashboardStats[];
    teamMembers: any[];
    pendingRequests: any[];
    teamGoals: any[];
    upcomingInterviews: any[];
    recentActivities: any[];
  }> {
    // In production, this would aggregate data from multiple services
    
    return {
      teamStats: [
        {
          label: 'Team Size',
          value: 12,
          change: '+2',
          changeType: 'increase',
          icon: 'users',
        },
        {
          label: 'Avg. Attendance',
          value: '96.5%',
          change: '+1.2%',
          changeType: 'increase',
          icon: 'clock',
        },
        {
          label: 'Team Performance',
          value: '4.2/5',
          change: '+0.3',
          changeType: 'increase',
          icon: 'trending-up',
        },
        {
          label: 'Open Positions',
          value: 3,
          change: '+1',
          changeType: 'increase',
          icon: 'briefcase',
        },
      ],
      teamMembers: await this.getTeamMembers(tenantId, managerId),
      pendingRequests: await this.getPendingRequests(tenantId, managerId),
      teamGoals: await this.getTeamGoals(tenantId, managerId),
      upcomingInterviews: await this.getUpcomingInterviews(tenantId, managerId),
      recentActivities: await this.getRecentActivities(tenantId, managerId),
    };
  }

  private async getTeamMembers(tenantId: string, managerId: string): Promise<any[]> {
    // Would query User service filtered by manager
    return [
      {
        id: '1',
        name: 'Sarah Chen',
        position: 'Senior Developer',
        status: 'Present',
        performance: 4.8,
        avatar: 'SC',
        statusColor: 'green',
      },
      {
        id: '2',
        name: 'Alex Rodriguez',
        position: 'UI/UX Designer',
        status: 'On Leave',
        performance: 4.5,
        avatar: 'AR',
        statusColor: 'yellow',
      },
      {
        id: '3',
        name: 'David Kim',
        position: 'Backend Developer',
        status: 'Present',
        performance: 4.2,
        avatar: 'DK',
        statusColor: 'green',
      },
    ];
  }

  private async getPendingRequests(tenantId: string, managerId: string): Promise<any[]> {
    // Would query Leave, Overtime, Performance services
    return [
      {
        id: '1',
        type: 'leave',
        employee: 'John Doe',
        request: 'Vacation Leave - 3 days',
        date: 'Dec 20-22',
        priority: 'medium',
      },
      {
        id: '2',
        type: 'overtime',
        employee: 'Sarah Chen',
        request: 'Overtime Approval',
        date: 'This week',
        priority: 'low',
      },
      {
        id: '3',
        type: 'performance',
        employee: 'Alex Rodriguez',
        request: 'Performance Review',
        date: 'Overdue',
        priority: 'high',
      },
    ];
  }

  private async getTeamGoals(tenantId: string, managerId: string): Promise<any[]> {
    // Would query Goals from Performance service
    return [
      {
        id: '1',
        title: 'Q4 Project Delivery',
        progress: 85,
        dueDate: '2024-12-31',
        status: 'on_track',
        owner: 'Team',
      },
      {
        id: '2',
        title: 'Reduce Bug Count by 30%',
        progress: 65,
        dueDate: '2024-12-31',
        status: 'at_risk',
        owner: 'Engineering',
      },
      {
        id: '3',
        title: 'Complete Training Modules',
        progress: 92,
        dueDate: '2024-12-15',
        status: 'on_track',
        owner: 'Team',
      },
    ];
  }

  private async getUpcomingInterviews(tenantId: string, managerId: string): Promise<any[]> {
    // Would query Interview/Recruitment service
    return [
      {
        id: '1',
        candidate: 'Michael Brown',
        position: 'Senior React Developer',
        time: 'Today, 2:00 PM',
        type: 'Technical Interview',
      },
      {
        id: '2',
        candidate: 'Lisa Johnson',
        position: 'UX Designer',
        time: 'Tomorrow, 10:00 AM',
        type: 'Portfolio Review',
      },
    ];
  }

  private async getRecentActivities(tenantId: string, managerId: string): Promise<any[]> {
    // Would query audit logs
    return [
      {
        id: '1',
        type: 'approval',
        description: 'Approved leave request for John Doe',
        timestamp: new Date().toISOString(),
      },
      {
        id: '2',
        type: 'review',
        description: 'Completed performance review for Sarah Chen',
        timestamp: new Date(Date.now() - 3600000).toISOString(),
      },
    ];
  }

  // ==================== HR DASHBOARD ====================

  async getHRDashboard(tenantId: string): Promise<{
    orgStats: DashboardStats[];
    departmentData: any[];
    criticalAlerts: any[];
    recentHires: any[];
    complianceMetrics: any;
    upcomingEvents: any[];
  }> {
    return {
      orgStats: [
        {
          label: 'Total Employees',
          value: 1247,
          change: '+23',
          changeType: 'increase',
          icon: 'users',
        },
        {
          label: 'New Hires (MTD)',
          value: 18,
          change: '+5',
          changeType: 'increase',
          icon: 'user-plus',
        },
        {
          label: 'Monthly Payroll',
          value: '$2.4M',
          change: '+8.2%',
          changeType: 'increase',
          icon: 'dollar-sign',
        },
        {
          label: 'Avg. Attendance',
          value: '94.8%',
          change: '-0.5%',
          changeType: 'decrease',
          icon: 'clock',
        },
      ],
      departmentData: await this.getDepartmentData(tenantId),
      criticalAlerts: await this.getCriticalAlerts(tenantId),
      recentHires: await this.getRecentHires(tenantId),
      complianceMetrics: await this.getComplianceMetrics(tenantId),
      upcomingEvents: await this.getUpcomingEvents(tenantId),
    };
  }

  private async getDepartmentData(tenantId: string): Promise<any[]> {
    // Would query Department and User services
    return [
      {
        id: '1',
        name: 'Engineering',
        employees: 450,
        headcount: 480,
        growth: '+15',
        performance: 4.2,
        color: 'blue',
      },
      {
        id: '2',
        name: 'Sales',
        employees: 180,
        headcount: 200,
        growth: '+8',
        performance: 4.0,
        color: 'green',
      },
      {
        id: '3',
        name: 'Marketing',
        employees: 75,
        headcount: 80,
        growth: '+3',
        performance: 4.1,
        color: 'purple',
      },
      {
        id: '4',
        name: 'Operations',
        employees: 120,
        headcount: 125,
        growth: '+2',
        performance: 3.9,
        color: 'orange',
      },
    ];
  }

  private async getCriticalAlerts(tenantId: string): Promise<any[]> {
    // Would query Training, Payroll, Performance services
    return [
      {
        id: '1',
        type: 'compliance',
        title: 'Compliance Training Overdue',
        message: '45 employees need to complete mandatory training by Dec 15',
        priority: 'high',
        icon: 'shield',
      },
      {
        id: '2',
        type: 'payroll',
        title: 'Payroll Processing Due',
        message: 'Monthly payroll processing required in 2 days',
        priority: 'medium',
        icon: 'dollar-sign',
      },
      {
        id: '3',
        type: 'performance',
        title: 'Performance Reviews',
        message: '23 managers have pending performance reviews',
        priority: 'medium',
        icon: 'bar-chart',
      },
    ];
  }

  private async getRecentHires(tenantId: string): Promise<any[]> {
    // Would query User service with recent join dates
    return [
      {
        id: '1',
        name: 'Emma Wilson',
        position: 'Senior UX Designer',
        department: 'Design',
        startDate: '2024-12-10',
        status: 'onboarding',
        avatar: 'EW',
      },
      {
        id: '2',
        name: 'Michael Chen',
        position: 'Backend Developer',
        department: 'Engineering',
        startDate: '2024-12-08',
        status: 'active',
        avatar: 'MC',
      },
      {
        id: '3',
        name: 'Sarah Johnson',
        position: 'Marketing Manager',
        department: 'Marketing',
        startDate: '2024-12-05',
        status: 'active',
        avatar: 'SJ',
      },
    ];
  }

  private async getComplianceMetrics(tenantId: string): Promise<any> {
    // Would query Audit/Compliance service
    return {
      overallScore: 92,
      areas: [
        { name: 'Data Protection', score: 95, status: 'compliant' },
        { name: 'Labor Laws', score: 88, status: 'compliant' },
        { name: 'Safety Standards', score: 91, status: 'compliant' },
        { name: 'Financial Compliance', score: 94, status: 'compliant' },
      ],
      lastAudit: '2024-11-15',
      nextAudit: '2025-02-15',
    };
  }

  private async getUpcomingEvents(tenantId: string): Promise<any[]> {
    // Would query Calendar/Events service
    return [
      {
        id: '1',
        title: 'All Hands Meeting',
        date: '2024-12-15',
        time: '10:00 AM',
        attendees: 1247,
        type: 'company',
      },
      {
        id: '2',
        title: 'HR Town Hall',
        date: '2024-12-20',
        time: '2:00 PM',
        attendees: 50,
        type: 'department',
      },
      {
        id: '3',
        title: 'Year End Party',
        date: '2024-12-22',
        time: '6:00 PM',
        attendees: 800,
        type: 'social',
      },
    ];
  }

  // ==================== ADMIN DASHBOARD ====================

  async getAdminDashboard(tenantId: string): Promise<{
    systemStats: DashboardStats[];
    systemHealth: any;
    recentActivity: any[];
    alerts: any[];
  }> {
    return {
      systemStats: [
        {
          label: 'Total Users',
          value: 1347,
          change: '+28',
          changeType: 'increase',
        },
        {
          label: 'Active Sessions',
          value: 234,
          change: '-12',
          changeType: 'decrease',
        },
        {
          label: 'API Calls (24h)',
          value: '45.2K',
          change: '+5.3%',
          changeType: 'increase',
        },
        {
          label: 'System Uptime',
          value: '99.98%',
          change: '',
          changeType: 'increase',
        },
      ],
      systemHealth: {
        status: 'healthy',
        cpu: 45,
        memory: 62,
        storage: 38,
        database: 'connected',
      },
      recentActivity: [],
      alerts: [],
    };
  }

  // ==================== EMPLOYEE DASHBOARD ====================

  async getEmployeeDashboard(tenantId: string, employeeId: string): Promise<{
    personalStats: DashboardStats[];
    upcomingTasks: any[];
    recentActivities: any[];
    myGoals: any[];
    trainingProgress: any[];
  }> {
    return {
      personalStats: [
        {
          label: 'Attendance',
          value: '98.5%',
          change: '+2.1%',
          changeType: 'increase',
        },
        {
          label: 'Leave Balance',
          value: '12 days',
          change: '',
        },
        {
          label: 'Goals Progress',
          value: '75%',
          change: '+10%',
          changeType: 'increase',
        },
        {
          label: 'Training Completed',
          value: '8/10',
          change: '+2',
          changeType: 'increase',
        },
      ],
      upcomingTasks: [],
      recentActivities: [],
      myGoals: [],
      trainingProgress: [],
    };
  }
}
