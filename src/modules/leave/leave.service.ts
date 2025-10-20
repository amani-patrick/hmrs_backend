import { Injectable, Inject, NotFoundException, BadRequestException } from '@nestjs/common';
import { Repository, Between } from 'typeorm';
import { LeaveRequest, LeaveStatus } from './entities/leave-request.entity';
import { LeaveType } from './entities/leave-type.entity';
import { LeaveBalance } from './entities/leave-balance.entity';
import { CreateLeaveRequestDto } from './dto/create-leave-request.dto';
import { UpdateLeaveRequestDto } from './dto/update-leave-request.dto';
import { ApproveLeaveRequestDto } from './dto/approve-leave-request.dto';
import { CreateLeaveTypeDto } from './dto/create-leave-type.dto';

@Injectable()
export class LeaveService {
  constructor(
    @Inject('LEAVE_REQUEST_REPOSITORY')
    private readonly leaveRequestRepository: Repository<LeaveRequest>,
    @Inject('LEAVE_TYPE_REPOSITORY')
    private readonly leaveTypeRepository: Repository<LeaveType>,
    @Inject('LEAVE_BALANCE_REPOSITORY')
    private readonly leaveBalanceRepository: Repository<LeaveBalance>,
  ) {}

  // ==================== LEAVE REQUESTS ====================

  async createLeaveRequest(
    tenantId: string,
    employeeId: string,
    dto: CreateLeaveRequestDto,
  ): Promise<LeaveRequest> {
    // Validate leave type
    const leaveType = await this.leaveTypeRepository.findOne({
      where: { id: dto.leaveTypeId, tenantId, isActive: true },
    });

    if (!leaveType) {
      throw new NotFoundException('Leave type not found or inactive');
    }

    // Calculate days
    const daysRequested = this.calculateLeaveDays(
      new Date(dto.startDate),
      new Date(dto.endDate),
      dto.halfDay || false,
    );

    // Check balance
    const balance = await this.getLeaveBalance(tenantId, employeeId, dto.leaveTypeId);
    if (balance && balance.availableDays < daysRequested && !leaveType.allowNegativeBalance) {
      throw new BadRequestException('Insufficient leave balance');
    }

    // Check minimum notice period
    if (leaveType.minDaysNotice > 0) {
      const daysUntilStart = this.calculateDaysUntil(new Date(dto.startDate));
      if (daysUntilStart < leaveType.minDaysNotice) {
        throw new BadRequestException(
          `Leave must be requested at least ${leaveType.minDaysNotice} days in advance`,
        );
      }
    }

    // Check max consecutive days
    if (leaveType.maxConsecutiveDays > 0 && daysRequested > leaveType.maxConsecutiveDays) {
      throw new BadRequestException(
        `Cannot request more than ${leaveType.maxConsecutiveDays} consecutive days`,
      );
    }

    const leaveRequest = this.leaveRequestRepository.create({
      ...dto,
      tenantId,
      employeeId,
      daysRequested,
      status: leaveType.requiresApproval ? LeaveStatus.PENDING : LeaveStatus.APPROVED,
    });

    const saved = await this.leaveRequestRepository.save(leaveRequest);

    // Update balance - add to pending
    if (balance) {
      balance.pendingDays += daysRequested;
      balance.availableDays -= daysRequested;
      await this.leaveBalanceRepository.save(balance);
    }

    return saved;
  }

  async getAllLeaveRequests(
    tenantId: string,
    filters?: {
      employeeId?: string;
      status?: LeaveStatus;
      startDate?: string;
      endDate?: string;
    },
  ): Promise<LeaveRequest[]> {
    const where: any = { tenantId };

    if (filters?.employeeId) where.employeeId = filters.employeeId;
    if (filters?.status) where.status = filters.status;

    if (filters?.startDate && filters?.endDate) {
      where.startDate = Between(new Date(filters.startDate), new Date(filters.endDate));
    }

    return this.leaveRequestRepository.find({
      where,
      relations: ['employee', 'leaveType', 'approver'],
      order: { createdAt: 'DESC' },
    });
  }

  async getLeaveRequestById(tenantId: string, id: string): Promise<LeaveRequest> {
    const request = await this.leaveRequestRepository.findOne({
      where: { id, tenantId },
      relations: ['employee', 'leaveType', 'approver'],
    });

    if (!request) {
      throw new NotFoundException(`Leave request with ID ${id} not found`);
    }

    return request;
  }

  async updateLeaveRequest(
    tenantId: string,
    id: string,
    dto: UpdateLeaveRequestDto,
  ): Promise<LeaveRequest> {
    const request = await this.getLeaveRequestById(tenantId, id);

    if (request.status !== LeaveStatus.PENDING) {
      throw new BadRequestException('Only pending requests can be updated');
    }

    // Recalculate days if dates changed
    if (dto.startDate || dto.endDate) {
      const startDate = dto.startDate ? new Date(dto.startDate) : request.startDate;
      const endDate = dto.endDate ? new Date(dto.endDate) : request.endDate;
      request.daysRequested = this.calculateLeaveDays(
        startDate,
        endDate,
        dto.halfDay !== undefined ? dto.halfDay : false,
      );
    }

    Object.assign(request, dto);
    return this.leaveRequestRepository.save(request);
  }

  async approveLeaveRequest(
    tenantId: string,
    id: string,
    approverId: string,
    dto: ApproveLeaveRequestDto,
  ): Promise<LeaveRequest> {
    const request = await this.getLeaveRequestById(tenantId, id);

    if (request.status !== LeaveStatus.PENDING) {
      throw new BadRequestException('Only pending requests can be approved/rejected');
    }

    request.status = dto.status;
    request.approverId = approverId;
    request.approverNotes = dto.approverNotes;
    request.approvedAt = new Date();

    const saved = await this.leaveRequestRepository.save(request);

    // Update balance
    const balance = await this.getLeaveBalance(tenantId, request.employeeId, request.leaveTypeId);
    if (balance) {
      balance.pendingDays -= request.daysRequested;

      if (dto.status === LeaveStatus.APPROVED) {
        balance.usedDays += request.daysRequested;
      } else {
        // Rejected - restore balance
        balance.availableDays += request.daysRequested;
      }

      await this.leaveBalanceRepository.save(balance);
    }

    return saved;
  }

  async cancelLeaveRequest(tenantId: string, id: string, employeeId: string): Promise<LeaveRequest> {
    const request = await this.getLeaveRequestById(tenantId, id);

    if (request.employeeId !== employeeId) {
      throw new BadRequestException('You can only cancel your own requests');
    }

    if (request.status === LeaveStatus.CANCELLED) {
      throw new BadRequestException('Request is already cancelled');
    }

    const previousStatus = request.status;
    request.status = LeaveStatus.CANCELLED;
    const saved = await this.leaveRequestRepository.save(request);

    // Restore balance
    const balance = await this.getLeaveBalance(tenantId, employeeId, request.leaveTypeId);
    if (balance) {
      if (previousStatus === LeaveStatus.PENDING) {
        balance.pendingDays -= request.daysRequested;
        balance.availableDays += request.daysRequested;
      } else if (previousStatus === LeaveStatus.APPROVED) {
        balance.usedDays -= request.daysRequested;
        balance.availableDays += request.daysRequested;
      }
      await this.leaveBalanceRepository.save(balance);
    }

    return saved;
  }

  async deleteLeaveRequest(tenantId: string, id: string): Promise<void> {
    const request = await this.getLeaveRequestById(tenantId, id);
    await this.leaveRequestRepository.remove(request);
  }

  // ==================== LEAVE TYPES ====================

  async createLeaveType(tenantId: string, dto: CreateLeaveTypeDto): Promise<LeaveType> {
    const leaveType = this.leaveTypeRepository.create({
      ...dto,
      tenantId,
    });
    return this.leaveTypeRepository.save(leaveType);
  }

  async getAllLeaveTypes(tenantId: string, activeOnly = true): Promise<LeaveType[]> {
    const where: any = { tenantId };
    if (activeOnly) where.isActive = true;

    return this.leaveTypeRepository.find({ where, order: { name: 'ASC' } });
  }

  async getLeaveTypeById(tenantId: string, id: string): Promise<LeaveType> {
    const leaveType = await this.leaveTypeRepository.findOne({
      where: { id, tenantId },
    });

    if (!leaveType) {
      throw new NotFoundException(`Leave type with ID ${id} not found`);
    }

    return leaveType;
  }

  // ==================== LEAVE BALANCES ====================

  async getLeaveBalance(
    tenantId: string,
    employeeId: string,
    leaveTypeId: string,
  ): Promise<LeaveBalance | null> {
    const year = new Date().getFullYear();
    return this.leaveBalanceRepository.findOne({
      where: { tenantId, employeeId, leaveTypeId, year },
    });
  }

  async getAllLeaveBalances(tenantId: string, employeeId: string): Promise<LeaveBalance[]> {
    const year = new Date().getFullYear();
    return this.leaveBalanceRepository.find({
      where: { tenantId, employeeId, year },
      order: { createdAt: 'ASC' },
    });
  }

  async initializeLeaveBalance(
    tenantId: string,
    employeeId: string,
    leaveTypeId: string,
  ): Promise<LeaveBalance> {
    const leaveType = await this.getLeaveTypeById(tenantId, leaveTypeId);
    const year = new Date().getFullYear();

    const existing = await this.getLeaveBalance(tenantId, employeeId, leaveTypeId);
    if (existing) {
      return existing;
    }

    const balance = this.leaveBalanceRepository.create({
      tenantId,
      employeeId,
      leaveTypeId,
      year,
      totalDays: leaveType.defaultDays,
      usedDays: 0,
      availableDays: leaveType.defaultDays,
      pendingDays: 0,
      carriedOverDays: 0,
    });

    return this.leaveBalanceRepository.save(balance);
  }

  // ==================== HELPER METHODS ====================

  private calculateLeaveDays(startDate: Date, endDate: Date, halfDay: boolean): number {
    if (halfDay) return 0.5;

    const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return diffDays;
  }

  private calculateDaysUntil(futureDate: Date): number {
    const now = new Date();
    const diffTime = futureDate.getTime() - now.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }
}
