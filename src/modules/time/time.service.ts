import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, MoreThanOrEqual, LessThanOrEqual, IsNull } from 'typeorm';
import { TimeEntry } from './entities/time-entry.entity';
import { OvertimeRequest } from './entities/overtime-request.entity';
import { CreateTimeEntryDto } from './dto/create-time-entry.dto';
import { CreateOvertimeRequestDto } from './dto/create-overtime-request.dto';
import { UpdateOvertimeRequestDto } from './dto/update-overtime-request.dto';
import { TimeTrackingStatsDto } from './dto/time-tracking-stats.dto';
import { TimeTrackingSummaryDto } from './dto/time-tracking-summary.dto';

@Injectable()
export class TimeService {
  constructor(
    @InjectRepository(TimeEntry)
    private timeEntryRepository: Repository<TimeEntry>,
    @InjectRepository(OvertimeRequest)
    private overtimeRequestRepository: Repository<OvertimeRequest>,
  ) {}

  // Time Tracking Methods
  async getTimeTrackingStats(date: Date = new Date()): Promise<TimeTrackingStatsDto> {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const [entries, stats] = await Promise.all([
      this.timeEntryRepository.find({
        where: {
          clockInTime: Between(startOfDay, endOfDay)
        },
        order: { clockInTime: 'DESC' }
      }),
      this.timeEntryRepository
        .createQueryBuilder('entry')
        .select('SUM(entry.hours)', 'total')
        .where('entry.clockInTime BETWEEN :start AND :end', {
          start: startOfDay,
          end: endOfDay
        })
        .getRawOne()
    ]);

    const currentStatus = entries.length > 0 && !entries[0].clockOutTime 
      ? 'Clocked In' 
      : 'Clocked Out';

    return {
      totalEntries: entries.length,
      totalHours: parseFloat(stats?.total || '0'),
      lastEntry: entries[0] || null,
      currentStatus
    };
  }

  async getProjectHoursSummary({ startDate, endDate }: { startDate?: Date; endDate?: Date }) {
    const query = this.timeEntryRepository
      .createQueryBuilder('entry')
      .select('entry.projectId', 'projectId')
      .addSelect('SUM(entry.hours)', 'totalHours')
      .groupBy('entry.projectId');

    if (startDate) {
      query.andWhere('entry.clockInTime >= :startDate', { startDate });
    }
    if (endDate) {
      query.andWhere('entry.clockInTime <= :endDate', { endDate });
    }

    return query.getRawMany();
  }

  async getUserOvertimeRequests(userId: string, status?: string): Promise<OvertimeRequest[]> {
    const query = this.overtimeRequestRepository
      .createQueryBuilder('request')
      .where('request.userId = :userId', { userId });
    
    if (status) {
      query.andWhere('request.status = :status', { status });
    }
    
    return query
      .orderBy('request.requestedAt', 'DESC')
      .getMany();
  }

  // Time Entry Methods
  async createTimeEntry(createTimeEntryDto: CreateTimeEntryDto): Promise<TimeEntry> {
    const timeEntry = this.timeEntryRepository.create({
      ...createTimeEntryDto,
      hours: 0 // Initialize with 0 hours, will be calculated on clock out
    });
    return this.timeEntryRepository.save(timeEntry);
  }

  async clockIn(userId: string, data: Partial<TimeEntry>): Promise<TimeEntry> {
    const timeEntry = this.timeEntryRepository.create({
      ...data,
      userId,
      clockInTime: new Date(),
    });
    return this.timeEntryRepository.save(timeEntry);
  }

  async clockOut(userId: string, timeEntryId: string): Promise<TimeEntry> {
    const timeEntry = await this.timeEntryRepository.findOne({
      where: { id: timeEntryId, userId },
    });

    if (!timeEntry) {
      throw new NotFoundException('Time entry not found');
    }

    const now = new Date();
    const hoursWorked = (now.getTime() - timeEntry.clockInTime.getTime()) / (1000 * 60 * 60);
    
    timeEntry.clockOutTime = now;
    timeEntry.hours = parseFloat(hoursWorked.toFixed(2));
    
    return this.timeEntryRepository.save(timeEntry);
  }

  // Get active time entries (clocked in but not clocked out)
  async getActiveTimeEntries(): Promise<TimeEntry[]> {
    return this.timeEntryRepository
      .createQueryBuilder('entry')
      .where('entry.clockOutTime IS NULL')
      .leftJoinAndSelect('entry.user', 'user')
      .getMany();
  }

  // Get time tracking summary for dashboard
  async getDashboardTimeTrackingStats(): Promise<{
    activeEmployees: number;
    totalHoursWorked: number;
    lateArrivals: number;
    remoteWorkers: number;
  }> {
    const today = new Date();
    const startOfDay = new Date(today);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(today);
    endOfDay.setHours(23, 59, 59, 999);

    const [activeEntries, totalHours, lateClockIns, remoteWorkers] = await Promise.all([
      this.timeEntryRepository.count({
        where: {
          clockInTime: LessThanOrEqual(endOfDay),
          clockOutTime: IsNull(),
        },
      }),
      this.timeEntryRepository
        .createQueryBuilder('entry')
        .select('SUM(entry.hours)', 'total')
        .where('entry.clockInTime BETWEEN :start AND :end', {
          start: startOfDay,
          end: endOfDay
        })
        .getRawOne(),
      this.timeEntryRepository.count({
        where: {
          clockInTime: Between(
            new Date(today.setHours(9, 30, 0, 0)),
            endOfDay
          ),
        },
      }),
      this.timeEntryRepository.count({
        where: {
          type: 'Remote',
          clockInTime: Between(startOfDay, endOfDay),
        },
      }),
    ]);

    return {
      activeEmployees: activeEntries || 0,
      totalHoursWorked: parseFloat(totalHours?.total || '0'),
      lateArrivals: lateClockIns || 0,
      remoteWorkers: remoteWorkers || 0,
    };
  }

  // Overtime Request Methods
  async createOvertimeRequest(
    userId: string,
    createOvertimeRequestDto: CreateOvertimeRequestDto,
  ): Promise<OvertimeRequest> {
    const startTime = new Date(createOvertimeRequestDto.startTime);
    const endTime = new Date(createOvertimeRequestDto.endTime);
    const hoursRequested = (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60);

    const overtimeRequest = this.overtimeRequestRepository.create({
      ...createOvertimeRequestDto,
      startTime,
      endTime,
      userId,
      hoursRequested: parseFloat(hoursRequested.toFixed(2)),
      status: 'Pending',
    });

    return this.overtimeRequestRepository.save(overtimeRequest);
  }

  async updateOvertimeRequestStatus(
    id: string,
    updateOvertimeRequestDto: UpdateOvertimeRequestDto,
    approvedById: string,
  ): Promise<OvertimeRequest> {
    const overtimeRequest = await this.overtimeRequestRepository.findOne({ where: { id } });

    if (!overtimeRequest) {
      throw new NotFoundException('Overtime request not found');
    }

    return this.overtimeRequestRepository.save({
      ...overtimeRequest,
      ...updateOvertimeRequestDto,
      approvedById,
      approvedAt: new Date(),
      approvalNotes: updateOvertimeRequestDto.notes,
    });
  }

  // Additional methods for reports and summaries...
}
