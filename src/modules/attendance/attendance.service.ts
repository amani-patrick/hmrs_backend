import { Injectable, Inject, NotFoundException, BadRequestException } from '@nestjs/common';
import { Repository, Between, In } from 'typeorm';
import { AttendanceRecord, AttendanceStatus, CheckInMethod } from './entities/attendance-record.entity';
import { AttendanceSummary } from './entities/attendance-summary.entity';
import { CheckInDto } from './dto/check-in.dto';
import { CheckOutDto } from './dto/check-out.dto';
import { MarkAttendanceDto } from './dto/mark-attendance.dto';

@Injectable()
export class AttendanceService {
  constructor(
    @Inject('ATTENDANCE_RECORD_REPOSITORY')
    private readonly attendanceRepository: Repository<AttendanceRecord>,
    @Inject('ATTENDANCE_SUMMARY_REPOSITORY')
    private readonly summaryRepository: Repository<AttendanceSummary>,
  ) {}

  // ==================== CHECK IN/OUT ====================

  async checkIn(tenantId: string, employeeId: string, dto: CheckInDto): Promise<AttendanceRecord> {
    const today = new Date().toISOString().split('T')[0];

    // Check if already checked in today
    const existing = await this.attendanceRepository.findOne({
      where: { tenantId, employeeId, date: new Date(today) },
    });

    if (existing && existing.checkInTime) {
      throw new BadRequestException('Already checked in today');
    }

    const now = new Date();
    const checkInTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

    if (existing) {
      existing.checkInTime = checkInTime;
      existing.checkInMethod = dto.method || CheckInMethod.WEB;
      existing.checkInLocation = dto.location || null;
      existing.status = AttendanceStatus.PRESENT;
      return this.attendanceRepository.save(existing);
    }

    const attendance = this.attendanceRepository.create({
      tenantId,
      employeeId,
      date: new Date(today),
      checkInTime,
      checkInMethod: dto.method || CheckInMethod.WEB,
      checkInLocation: dto.location,
      status: AttendanceStatus.PRESENT,
      notes: dto.notes,
    });

    return this.attendanceRepository.save(attendance);
  }

  async checkOut(tenantId: string, employeeId: string, dto: CheckOutDto): Promise<AttendanceRecord> {
    const today = new Date().toISOString().split('T')[0];

    const attendance = await this.attendanceRepository.findOne({
      where: { tenantId, employeeId, date: new Date(today) },
    });

    if (!attendance) {
      throw new NotFoundException('No check-in record found for today');
    }

    if (!attendance.checkInTime) {
      throw new BadRequestException('Must check in before checking out');
    }

    if (attendance.checkOutTime) {
      throw new BadRequestException('Already checked out today');
    }

    const now = new Date();
    const checkOutTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

    attendance.checkOutTime = checkOutTime;
    attendance.checkOutMethod = dto.method || CheckInMethod.WEB;
    attendance.checkOutLocation = dto.location;

    // Calculate hours worked
    if (attendance.checkInTime) {
      const hoursWorked = this.calculateHoursWorked(attendance.checkInTime, checkOutTime);
      attendance.hoursWorked = hoursWorked;

      // Calculate overtime (assuming 8 hours standard)
      if (hoursWorked > 8) {
        attendance.overtimeHours = hoursWorked - 8;
      }
    }

    return this.attendanceRepository.save(attendance);
  }

  // ==================== MANUAL ATTENDANCE ====================

  async markAttendance(tenantId: string, dto: MarkAttendanceDto): Promise<AttendanceRecord> {
    const existing = await this.attendanceRepository.findOne({
      where: { tenantId, employeeId: dto.employeeId, date: new Date(dto.date) },
    });

    if (existing) {
      Object.assign(existing, {
        status: dto.status,
        checkInTime: dto.checkInTime || existing.checkInTime,
        checkOutTime: dto.checkOutTime || existing.checkOutTime,
        notes: dto.notes || existing.notes,
      });

      if (existing.checkInTime && existing.checkOutTime) {
        existing.hoursWorked = this.calculateHoursWorked(existing.checkInTime, existing.checkOutTime);
      }

      return this.attendanceRepository.save(existing);
    }

    const attendance = this.attendanceRepository.create({
      tenantId,
      employeeId: dto.employeeId,
      date: new Date(dto.date),
      status: dto.status,
      checkInTime: dto.checkInTime,
      checkOutTime: dto.checkOutTime,
      notes: dto.notes,
    });

    if (attendance.checkInTime && attendance.checkOutTime) {
      attendance.hoursWorked = this.calculateHoursWorked(attendance.checkInTime, attendance.checkOutTime);
    }

    return this.attendanceRepository.save(attendance);
  }

  // ==================== QUERIES ====================

  async getAttendanceRecords(
    tenantId: string,
    filters?: {
      employeeId?: string;
      status?: AttendanceStatus;
      startDate?: string;
      endDate?: string;
      department?: string;
    },
  ): Promise<AttendanceRecord[]> {
    const where: any = { tenantId };

    if (filters?.employeeId) where.employeeId = filters.employeeId;
    if (filters?.status) where.status = filters.status;

    if (filters?.startDate && filters?.endDate) {
      where.date = Between(new Date(filters.startDate), new Date(filters.endDate));
    }

    return this.attendanceRepository.find({
      where,
      order: { date: 'DESC', checkInTime: 'ASC' },
    });
  }

  async getMyAttendance(tenantId: string, employeeId: string, month?: number, year?: number): Promise<AttendanceRecord[]> {
    const currentDate = new Date();
    const targetMonth = month || currentDate.getMonth() + 1;
    const targetYear = year || currentDate.getFullYear();

    const startDate = new Date(targetYear, targetMonth - 1, 1);
    const endDate = new Date(targetYear, targetMonth, 0);

    return this.attendanceRepository.find({
      where: {
        tenantId,
        employeeId,
        date: Between(startDate, endDate),
      },
      order: { date: 'ASC' },
    });
  }

  async getTodayAttendance(tenantId: string, employeeId: string): Promise<AttendanceRecord | null> {
    const today = new Date().toISOString().split('T')[0];
    return this.attendanceRepository.findOne({
      where: { tenantId, employeeId, date: new Date(today) },
    });
  }

  async getAttendanceById(tenantId: string, id: string): Promise<AttendanceRecord> {
    const attendance = await this.attendanceRepository.findOne({
      where: { id, tenantId },
    });

    if (!attendance) {
      throw new NotFoundException(`Attendance record with ID ${id} not found`);
    }

    return attendance;
  }

  // ==================== SUMMARIES ====================

  async getAttendanceSummary(
    tenantId: string,
    employeeId: string,
    month: number,
    year: number,
  ): Promise<AttendanceSummary> {
    const summary = await this.summaryRepository.findOne({
      where: { tenantId, employeeId, month, year },
    });

    if (!summary) {
      // Generate summary if not exists
      return this.generateSummary(tenantId, employeeId, month, year);
    }

    return summary;
  }

  async generateSummary(
    tenantId: string,
    employeeId: string,
    month: number,
    year: number,
  ): Promise<AttendanceSummary> {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);

    const records = await this.attendanceRepository.find({
      where: {
        tenantId,
        employeeId,
        date: Between(startDate, endDate),
      },
    });

    // Calculate statistics
    const workingDays = this.calculateWorkingDays(month, year);
    const presentDays = records.filter((r) => r.status === AttendanceStatus.PRESENT).length;
    const absentDays = records.filter((r) => r.status === AttendanceStatus.ABSENT).length;
    const lateDays = records.filter((r) => r.isLate).length;
    const halfDays = records.filter((r) => r.status === AttendanceStatus.HALF_DAY).length;
    const leaveDays = records.filter((r) => r.status === AttendanceStatus.ON_LEAVE).length;
    const holidays = records.filter((r) => r.status === AttendanceStatus.HOLIDAY).length;

    const attendanceRate = workingDays > 0 ? (presentDays / workingDays) * 100 : 0;
    const punctualityRate = presentDays > 0 ? ((presentDays - lateDays) / presentDays) * 100 : 100;

    const totalHours = records.reduce((sum, r) => sum + (r.hoursWorked || 0), 0);
    const overtimeHours = records.reduce((sum, r) => sum + (r.overtimeHours || 0), 0);
    const averageHours = presentDays > 0 ? totalHours / presentDays : 0;

    const totalLateMinutes = records.reduce((sum, r) => sum + r.lateMinutes, 0);
    const totalEarlyLeaveMinutes = records.reduce((sum, r) => sum + r.earlyLeaveMinutes, 0);

    const summary = this.summaryRepository.create({
      tenantId,
      employeeId,
      employeeName: 'Employee Name', // Would be fetched from User service
      month,
      year,
      workingDays,
      presentDays,
      absentDays,
      lateDays,
      halfDays,
      leaveDays,
      holidays,
      attendanceRate: Number(attendanceRate.toFixed(2)),
      punctualityRate: Number(punctualityRate.toFixed(2)),
      totalHours: Number(totalHours.toFixed(2)),
      overtimeHours: Number(overtimeHours.toFixed(2)),
      averageHours: Number(averageHours.toFixed(2)),
      totalLateMinutes,
      totalEarlyLeaveMinutes,
    });

    return this.summaryRepository.save(summary);
  }

  async getAllSummaries(
    tenantId: string,
    month: number,
    year: number,
    department?: string,
  ): Promise<AttendanceSummary[]> {
    const where: any = { tenantId, month, year };
    if (department) where.department = department;

    return this.summaryRepository.find({
      where,
      order: { attendanceRate: 'DESC' },
    });
  }

  // ==================== HELPER METHODS ====================

  private calculateHoursWorked(checkIn: string, checkOut: string): number {
    const [inHour, inMin] = checkIn.split(':').map(Number);
    const [outHour, outMin] = checkOut.split(':').map(Number);

    const inMinutes = inHour * 60 + inMin;
    const outMinutes = outHour * 60 + outMin;

    return Number(((outMinutes - inMinutes) / 60).toFixed(2));
  }

  private calculateWorkingDays(month: number, year: number): number {
    const daysInMonth = new Date(year, month, 0).getDate();
    let workingDays = 0;

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month - 1, day);
      const dayOfWeek = date.getDay();
      // Exclude weekends (0 = Sunday, 6 = Saturday)
      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        workingDays++;
      }
    }

    return workingDays;
  }

  async deleteAttendanceRecord(tenantId: string, id: string): Promise<void> {
    const record = await this.getAttendanceById(tenantId, id);
    await this.attendanceRepository.remove(record);
  }
}
