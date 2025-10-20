import { Controller, Get, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiSecurity } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { DashboardService } from './dashboard.service';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/enums/roles.enum';

@ApiTags('Dashboard')
@ApiBearerAuth()
@ApiSecurity('tenant-id')
@Controller('dashboard')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('manager')
  @Roles(Role.MANAGER, Role.ADMIN)
  @ApiOperation({ summary: 'Get manager dashboard' })
  @ApiResponse({ status: 200, description: 'Manager dashboard retrieved successfully' })
  async getManagerDashboard(@Req() req: any) {
    const tenantId = req.tenantId;
    const managerId = req.user.userId;
    return this.dashboardService.getManagerDashboard(tenantId, managerId);
  }

  @Get('hr')
  @Roles(Role.HR, Role.ADMIN)
  @ApiOperation({ summary: 'Get HR dashboard' })
  @ApiResponse({ status: 200, description: 'HR dashboard retrieved successfully' })
  async getHRDashboard(@Req() req: any) {
    const tenantId = req.tenantId;
    return this.dashboardService.getHRDashboard(tenantId);
  }

  @Get('admin')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Get admin dashboard' })
  @ApiResponse({ status: 200, description: 'Admin dashboard retrieved successfully' })
  async getAdminDashboard(@Req() req: any) {
    const tenantId = req.tenantId;
    return this.dashboardService.getAdminDashboard(tenantId);
  }

  @Get('employee')
  @ApiOperation({ summary: 'Get employee dashboard' })
  @ApiResponse({ status: 200, description: 'Employee dashboard retrieved successfully' })
  async getEmployeeDashboard(@Req() req: any) {
    const tenantId = req.tenantId;
    const employeeId = req.user.userId;
    return this.dashboardService.getEmployeeDashboard(tenantId, employeeId);
  }
}
