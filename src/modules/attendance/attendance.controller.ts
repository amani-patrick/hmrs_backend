import { Controller, Get, Post, Delete, Body, Param, Query, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiSecurity, ApiQuery } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { AttendanceService } from './attendance.service';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/enums/roles.enum';
import { CheckInDto } from './dto/check-in.dto';
import { CheckOutDto } from './dto/check-out.dto';
import { MarkAttendanceDto } from './dto/mark-attendance.dto';
import { AttendanceStatus } from './entities/attendance-record.entity';

@ApiTags('Attendance Management')
@ApiBearerAuth()
@ApiSecurity('tenant-id')
@Controller('attendance')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  // ==================== CHECK IN/OUT ====================

  @Post('check-in')
  @ApiOperation({ summary: 'Check in for the day' })
  @ApiResponse({ status: 201, description: 'Checked in successfully' })
  @ApiResponse({ status: 400, description: 'Already checked in' })
  async checkIn(@Req() req: any, @Body() dto: CheckInDto) {
    const tenantId = req.tenantId;
    const employeeId = req.user.userId;
    return this.attendanceService.checkIn(tenantId, employeeId, dto);
  }

  @Post('check-out')
  @ApiOperation({ summary: 'Check out for the day' })
  @ApiResponse({ status: 200, description: 'Checked out successfully' })
  @ApiResponse({ status: 400, description: 'Must check in first' })
  async checkOut(@Req() req: any, @Body() dto: CheckOutDto) {
    const tenantId = req.tenantId;
    const employeeId = req.user.userId;
    return this.attendanceService.checkOut(tenantId, employeeId, dto);
  }

  @Get('today')
  @ApiOperation({ summary: 'Get today attendance status' })
  @ApiResponse({ status: 200, description: 'Today attendance retrieved' })
  async getTodayAttendance(@Req() req: any) {
    const tenantId = req.tenantId;
    const employeeId = req.user.userId;
    return this.attendanceService.getTodayAttendance(tenantId, employeeId);
  }

  // ==================== MANUAL MARKING ====================

  @Post('mark')
  @Roles(Role.MANAGER, Role.HR, Role.ADMIN)
  @ApiOperation({ summary: 'Mark attendance manually' })
  @ApiResponse({ status: 201, description: 'Attendance marked successfully' })
  async markAttendance(@Req() req: any, @Body() dto: MarkAttendanceDto) {
    return this.attendanceService.markAttendance(req.tenantId, dto);
  }

  // ==================== QUERIES ====================

  @Get('records')
  @Roles(Role.MANAGER, Role.HR, Role.ADMIN)
  @ApiOperation({ summary: 'Get attendance records' })
  @ApiQuery({ name: 'employeeId', required: false })
  @ApiQuery({ name: 'status', enum: AttendanceStatus, required: false })
  @ApiQuery({ name: 'startDate', required: false })
  @ApiQuery({ name: 'endDate', required: false })
  @ApiQuery({ name: 'department', required: false })
  @ApiResponse({ status: 200, description: 'Records retrieved successfully' })
  async getAttendanceRecords(
    @Req() req: any,
    @Query('employeeId') employeeId?: string,
    @Query('status') status?: AttendanceStatus,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('department') department?: string,
  ) {
    return this.attendanceService.getAttendanceRecords(req.tenantId, {
      employeeId,
      status,
      startDate,
      endDate,
      department,
    });
  }

  @Get('my')
  @ApiOperation({ summary: 'Get my attendance records' })
  @ApiQuery({ name: 'month', required: false, example: 12 })
  @ApiQuery({ name: 'year', required: false, example: 2024 })
  @ApiResponse({ status: 200, description: 'My attendance retrieved successfully' })
  async getMyAttendance(
    @Req() req: any,
    @Query('month') month?: number,
    @Query('year') year?: number,
  ) {
    const employeeId = req.user.userId;
    return this.attendanceService.getMyAttendance(req.tenantId, employeeId, month, year);
  }

  @Get('records/:id')
  @ApiOperation({ summary: 'Get attendance record by ID' })
  @ApiResponse({ status: 200, description: 'Record retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Record not found' })
  async getAttendanceById(@Req() req: any, @Param('id') id: string) {
    return this.attendanceService.getAttendanceById(req.tenantId, id);
  }

  // ==================== SUMMARIES ====================

  @Get('summary/my')
  @ApiOperation({ summary: 'Get my attendance summary' })
  @ApiQuery({ name: 'month', required: false, example: 12 })
  @ApiQuery({ name: 'year', required: false, example: 2024 })
  @ApiResponse({ status: 200, description: 'Summary retrieved successfully' })
  async getMySummary(
    @Req() req: any,
    @Query('month') month?: number,
    @Query('year') year?: number,
  ) {
    const currentDate = new Date();
    const targetMonth = month || currentDate.getMonth() + 1;
    const targetYear = year || currentDate.getFullYear();
    const employeeId = req.user.userId;

    return this.attendanceService.getAttendanceSummary(
      req.tenantId,
      employeeId,
      targetMonth,
      targetYear,
    );
  }

  @Get('summary/:employeeId')
  @Roles(Role.MANAGER, Role.HR, Role.ADMIN)
  @ApiOperation({ summary: 'Get employee attendance summary' })
  @ApiQuery({ name: 'month', required: true })
  @ApiQuery({ name: 'year', required: true })
  @ApiResponse({ status: 200, description: 'Summary retrieved successfully' })
  async getEmployeeSummary(
    @Req() req: any,
    @Param('employeeId') employeeId: string,
    @Query('month') month: number,
    @Query('year') year: number,
  ) {
    return this.attendanceService.getAttendanceSummary(req.tenantId, employeeId, month, year);
  }

  @Get('summaries')
  @Roles(Role.HR, Role.ADMIN)
  @ApiOperation({ summary: 'Get all attendance summaries' })
  @ApiQuery({ name: 'month', required: true })
  @ApiQuery({ name: 'year', required: true })
  @ApiQuery({ name: 'department', required: false })
  @ApiResponse({ status: 200, description: 'Summaries retrieved successfully' })
  async getAllSummaries(
    @Req() req: any,
    @Query('month') month: number,
    @Query('year') year: number,
    @Query('department') department?: string,
  ) {
    return this.attendanceService.getAllSummaries(req.tenantId, month, year, department);
  }

  @Post('summary/generate')
  @Roles(Role.HR, Role.ADMIN)
  @ApiOperation({ summary: 'Generate attendance summary for employee' })
  @ApiResponse({ status: 201, description: 'Summary generated successfully' })
  async generateSummary(
    @Req() req: any,
    @Body() body: { employeeId: string; month: number; year: number },
  ) {
    return this.attendanceService.generateSummary(
      req.tenantId,
      body.employeeId,
      body.month,
      body.year,
    );
  }

  // ==================== DELETE ====================

  @Delete('records/:id')
  @Roles(Role.HR, Role.ADMIN)
  @ApiOperation({ summary: 'Delete attendance record' })
  @ApiResponse({ status: 200, description: 'Record deleted successfully' })
  async deleteAttendanceRecord(@Req() req: any, @Param('id') id: string) {
    await this.attendanceService.deleteAttendanceRecord(req.tenantId, id);
    return { message: 'Attendance record deleted successfully' };
  }
}
