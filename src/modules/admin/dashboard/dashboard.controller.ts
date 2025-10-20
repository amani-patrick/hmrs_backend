import { Controller, UseGuards, Get } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiSecurity } from '@nestjs/swagger';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { Role } from '../../../common/enums/roles.enum';
import { DashboardService } from './dashboard.service';

@ApiTags('Dashboard')
@ApiBearerAuth()
@ApiSecurity('tenant-id')
@Controller('admin/dashboard')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles(Role.ADMIN)
export class DashboardController {
    constructor(private readonly dashboardService: DashboardService) {}

    @Get('summary')
    @ApiOperation({ summary: 'Get dashboard summary with metrics, growth data, and recent activity' })
    @ApiResponse({ status: 200, description: 'Dashboard summary retrieved successfully' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 403, description: 'Forbidden - Admin role required' })
    async getDashboardSummary() {
        const [summary, growth, activity, departmentDistribution] = await Promise.all([
            this.dashboardService.getSummaryMetrics(),
            this.dashboardService.getEmployeeGrowthGraph(),
            this.dashboardService.getRecentActivity(),
            this.dashboardService.getDepartmentDistribution(),
        ]);
        
        return {
            cards: summary, 
            growthData: growth,
            departmentDistribution,
            quickActions: [
                { label: 'Add Employee', action: 'add_employee', icon: 'user-plus' },
                { label: 'Schedule Interview', action: 'schedule_interview', icon: 'calendar' },
                { label: 'View Reports', action: 'view_reports', icon: 'file-text' },
                { label: 'Process Payroll', action: 'process_payroll', icon: 'dollar-sign' },
            ],
            recentActivity: activity,
            upcomingEvents: [],
        };
    }

    @Get('metrics')
    @ApiOperation({ summary: 'Get detailed dashboard metrics only' })
    @ApiResponse({ status: 200, description: 'Metrics retrieved successfully' })
    async getMetrics() {
        return this.dashboardService.getSummaryMetrics();
    }

    @Get('growth')
    @ApiOperation({ summary: 'Get employee growth chart data' })
    @ApiResponse({ status: 200, description: 'Growth data retrieved successfully' })
    async getGrowthData() {
        return this.dashboardService.getEmployeeGrowthGraph();
    }

    @Get('activity')
    @ApiOperation({ summary: 'Get recent activity feed' })
    @ApiResponse({ status: 200, description: 'Activity feed retrieved successfully' })
    async getRecentActivity() {
        return this.dashboardService.getRecentActivity();
    }

    @Get('departments')
    @ApiOperation({ summary: 'Get department-wise employee distribution' })
    @ApiResponse({ status: 200, description: 'Department distribution retrieved successfully' })
    async getDepartmentDistribution() {
        return this.dashboardService.getDepartmentDistribution();
    }

    @Get('payroll-summary')
    @ApiOperation({ summary: 'Get payroll summary' })
    @ApiResponse({ status: 200, description: 'Payroll summary retrieved successfully' })
    async getPayrollSummary() {
        return this.dashboardService.getPayrollSummary();
    }
}

