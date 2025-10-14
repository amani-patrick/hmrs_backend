// src/modules/payroll/payroll.controller.ts
import { Controller, Get, Post, UseGuards, Req } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/enums/roles.enum';
import { PayrollService } from './payroll.service';

@Controller('payroll')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles(Role.ADMIN, Role.HR)
export class PayrollController {
  constructor(private readonly payrollService: PayrollService) {}

  @Get('overview/stats')
  getOverviewStats() {
    return this.payrollService.getOverviewStats();
  }

  @Post('process')
  @Roles(Role.ADMIN)
  async processPayroll(@Req() req) {
    const billId = await this.payrollService.processMonthlyPayroll(req.user.tenantId);
    return { 
      message: 'Payroll processing initiated', 
      billId,
      notification: `Payroll processing started on ${new Date().toISOString().split('T')[0]}`
    };
  }
  
  @Get('periods')
  getRecentPeriods() {
    return [
      { month: 'Oct 2025', netTotal: 45000000 }, 
      { month: 'Sep 2025', netTotal: 44500000 }
    ];
  }

  @Get('benefits/stats')
  getBenefitsStats() {
    return this.payrollService.getBenefitsStats();
  }
  
  @Get('benefits')
  getBenefitsPlans() {
    return [];
  }
}