import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiSecurity, ApiQuery } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { LeaveService } from './leave.service';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/enums/roles.enum';
import { CreateLeaveRequestDto } from './dto/create-leave-request.dto';
import { UpdateLeaveRequestDto } from './dto/update-leave-request.dto';
import { ApproveLeaveRequestDto } from './dto/approve-leave-request.dto';
import { CreateLeaveTypeDto } from './dto/create-leave-type.dto';
import { LeaveStatus } from './entities/leave-request.entity';

@ApiTags('Leave Management')
@ApiBearerAuth()
@ApiSecurity('tenant-id')
@Controller('leave')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class LeaveController {
  constructor(private readonly leaveService: LeaveService) {}

  // ==================== LEAVE REQUESTS ====================

  @Post('requests')
  @ApiOperation({ summary: 'Create leave request' })
  @ApiResponse({ status: 201, description: 'Leave request created successfully' })
  @ApiResponse({ status: 400, description: 'Insufficient balance or validation error' })
  async createLeaveRequest(@Req() req: any, @Body() dto: CreateLeaveRequestDto) {
    const tenantId = req.tenantId;
    const employeeId = req.user.userId;
    return this.leaveService.createLeaveRequest(tenantId, employeeId, dto);
  }

  @Get('requests')
  @ApiOperation({ summary: 'Get all leave requests' })
  @ApiQuery({ name: 'employeeId', required: false })
  @ApiQuery({ name: 'status', enum: LeaveStatus, required: false })
  @ApiQuery({ name: 'startDate', required: false })
  @ApiQuery({ name: 'endDate', required: false })
  @ApiResponse({ status: 200, description: 'Leave requests retrieved successfully' })
  async getAllLeaveRequests(
    @Req() req: any,
    @Query('employeeId') employeeId?: string,
    @Query('status') status?: LeaveStatus,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.leaveService.getAllLeaveRequests(req.tenantId, {
      employeeId,
      status,
      startDate,
      endDate,
    });
  }

  @Get('requests/my')
  @ApiOperation({ summary: 'Get my leave requests' })
  @ApiResponse({ status: 200, description: 'My requests retrieved successfully' })
  async getMyLeaveRequests(@Req() req: any) {
    const employeeId = req.user.userId;
    return this.leaveService.getAllLeaveRequests(req.tenantId, { employeeId });
  }

  @Get('requests/pending')
  @Roles(Role.MANAGER, Role.HR, Role.ADMIN)
  @ApiOperation({ summary: 'Get pending leave requests for approval' })
  @ApiResponse({ status: 200, description: 'Pending requests retrieved successfully' })
  async getPendingRequests(@Req() req: any) {
    return this.leaveService.getAllLeaveRequests(req.tenantId, {
      status: LeaveStatus.PENDING,
    });
  }

  @Get('requests/:id')
  @ApiOperation({ summary: 'Get leave request by ID' })
  @ApiResponse({ status: 200, description: 'Leave request retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Leave request not found' })
  async getLeaveRequestById(@Req() req: any, @Param('id') id: string) {
    return this.leaveService.getLeaveRequestById(req.tenantId, id);
  }

  @Put('requests/:id')
  @ApiOperation({ summary: 'Update leave request' })
  @ApiResponse({ status: 200, description: 'Leave request updated successfully' })
  @ApiResponse({ status: 400, description: 'Only pending requests can be updated' })
  async updateLeaveRequest(
    @Req() req: any,
    @Param('id') id: string,
    @Body() dto: UpdateLeaveRequestDto,
  ) {
    return this.leaveService.updateLeaveRequest(req.tenantId, id, dto);
  }

  @Post('requests/:id/approve')
  @Roles(Role.MANAGER, Role.HR, Role.ADMIN)
  @ApiOperation({ summary: 'Approve or reject leave request' })
  @ApiResponse({ status: 200, description: 'Leave request processed successfully' })
  @ApiResponse({ status: 400, description: 'Only pending requests can be approved' })
  async approveLeaveRequest(
    @Req() req: any,
    @Param('id') id: string,
    @Body() dto: ApproveLeaveRequestDto,
  ) {
    const approverId = req.user.userId;
    return this.leaveService.approveLeaveRequest(req.tenantId, id, approverId, dto);
  }

  @Post('requests/:id/cancel')
  @ApiOperation({ summary: 'Cancel leave request' })
  @ApiResponse({ status: 200, description: 'Leave request cancelled successfully' })
  @ApiResponse({ status: 400, description: 'Cannot cancel this request' })
  async cancelLeaveRequest(@Req() req: any, @Param('id') id: string) {
    const employeeId = req.user.userId;
    return this.leaveService.cancelLeaveRequest(req.tenantId, id, employeeId);
  }

  @Delete('requests/:id')
  @Roles(Role.HR, Role.ADMIN)
  @ApiOperation({ summary: 'Delete leave request' })
  @ApiResponse({ status: 200, description: 'Leave request deleted successfully' })
  async deleteLeaveRequest(@Req() req: any, @Param('id') id: string) {
    await this.leaveService.deleteLeaveRequest(req.tenantId, id);
    return { message: 'Leave request deleted successfully' };
  }

  // ==================== LEAVE TYPES ====================

  @Post('types')
  @Roles(Role.HR, Role.ADMIN)
  @ApiOperation({ summary: 'Create leave type' })
  @ApiResponse({ status: 201, description: 'Leave type created successfully' })
  async createLeaveType(@Req() req: any, @Body() dto: CreateLeaveTypeDto) {
    return this.leaveService.createLeaveType(req.tenantId, dto);
  }

  @Get('types')
  @ApiOperation({ summary: 'Get all leave types' })
  @ApiQuery({ name: 'activeOnly', type: Boolean, required: false })
  @ApiResponse({ status: 200, description: 'Leave types retrieved successfully' })
  async getAllLeaveTypes(@Req() req: any, @Query('activeOnly') activeOnly?: boolean) {
    return this.leaveService.getAllLeaveTypes(req.tenantId, activeOnly !== false);
  }

  @Get('types/:id')
  @ApiOperation({ summary: 'Get leave type by ID' })
  @ApiResponse({ status: 200, description: 'Leave type retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Leave type not found' })
  async getLeaveTypeById(@Req() req: any, @Param('id') id: string) {
    return this.leaveService.getLeaveTypeById(req.tenantId, id);
  }

  // ==================== LEAVE BALANCES ====================

  @Get('balances/my')
  @ApiOperation({ summary: 'Get my leave balances' })
  @ApiResponse({ status: 200, description: 'Leave balances retrieved successfully' })
  async getMyLeaveBalances(@Req() req: any) {
    const employeeId = req.user.userId;
    return this.leaveService.getAllLeaveBalances(req.tenantId, employeeId);
  }

  @Get('balances/:employeeId')
  @Roles(Role.MANAGER, Role.HR, Role.ADMIN)
  @ApiOperation({ summary: 'Get employee leave balances' })
  @ApiResponse({ status: 200, description: 'Leave balances retrieved successfully' })
  async getEmployeeLeaveBalances(@Req() req: any, @Param('employeeId') employeeId: string) {
    return this.leaveService.getAllLeaveBalances(req.tenantId, employeeId);
  }

  @Post('balances/initialize')
  @Roles(Role.HR, Role.ADMIN)
  @ApiOperation({ summary: 'Initialize leave balance for employee' })
  @ApiResponse({ status: 201, description: 'Leave balance initialized successfully' })
  async initializeLeaveBalance(
    @Req() req: any,
    @Body() body: { employeeId: string; leaveTypeId: string },
  ) {
    return this.leaveService.initializeLeaveBalance(
      req.tenantId,
      body.employeeId,
      body.leaveTypeId,
    );
  }
}
