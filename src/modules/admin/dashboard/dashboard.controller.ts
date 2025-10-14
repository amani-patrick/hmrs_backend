import { Controller, UseGuards, Req, Get } from '@nestjs/common';
import { AuthGuard} from '@nestjs/passport';
import {RolesGuard} from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/enums/roles.enum';
import { DashboardService } from './dashboard.service';



@Controller('admin/dashboard')
@UseGuards(AuthGuard('jwt'),RolesGuard)
@Roles(Role.ADMIN)
export class DashboardController {
    constructor(private readonly dashboardService: DashboardService){
        @Get('summary')
        async getDashboardSummary(){
            const summary=await this.dashboardService.getSummaryMetrics();
            const growth = await this.dashboardService.getEmployeeGrowthGraph();
            const activity = await this.dashboardService.getRecentActivity();
        }
        return {
      cards: summary, // Employees, New Hires, Payroll, Attendance
      growthData: growth,
      quickActions: ['add employee', 'schedule interview', 'view reports', 'process payroll'],
      recentActivity: activity,
      upcomingEvents: [], // Fetched from Calendar/Event service

      return {
        cards: summary, // Employees, New Hires, Payroll, Attendance
        growthData: growth,
        quickActions: ['add employee', 'schedule interview', 'view reports', 'process payroll'],
        recentActivity: activity,
        upcomingEvents: [], // Fetched from Calendar/Event service
      };
    };
    }
}
