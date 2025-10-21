import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Ticket, TicketStatus, TicketPriority } from './entities/ticket.entity';
import { TicketResponse } from './entities/ticket-response.entity';
import { CreateTicketDto } from './dto/create-ticket.dto';

@Injectable()
export class HelpdeskService {
  constructor(
    @Inject('TICKET_REPOSITORY')
    private readonly ticketRepository: Repository<Ticket>,
    @Inject('TICKET_RESPONSE_REPOSITORY')
    private readonly responseRepository: Repository<TicketResponse>,
  ) {}

  // ==================== TICKET OPERATIONS ====================

  async createTicket(
    tenantId: string,
    userId: string,
    userName: string,
    dto: CreateTicketDto,
  ): Promise<Ticket> {
    const ticketNumber = await this.generateTicketNumber(tenantId);

    const ticket = this.ticketRepository.create({
      ...dto,
      tenantId,
      ticketNumber,
      createdBy: userId,
      createdByName: userName,
      status: TicketStatus.OPEN,
      priority: dto.priority || TicketPriority.MEDIUM,
    });

    return this.ticketRepository.save(ticket);
  }

  async getMyTickets(
    tenantId: string,
    userId: string,
    filters?: { status?: TicketStatus; category?: string },
  ): Promise<Ticket[]> {
    const where: any = { tenantId, createdBy: userId };

    if (filters?.status) where.status = filters.status;
    if (filters?.category) where.category = filters.category;

    return this.ticketRepository.find({
      where,
      order: { createdAt: 'DESC' },
    });
  }

  async getAssignedTickets(
    tenantId: string,
    userId: string,
    filters?: { status?: TicketStatus },
  ): Promise<Ticket[]> {
    const where: any = { tenantId, assignedTo: userId };

    if (filters?.status) where.status = filters.status;

    return this.ticketRepository.find({
      where,
      order: { priority: 'DESC', createdAt: 'ASC' },
    });
  }

  async getAllTickets(
    tenantId: string,
    filters?: { status?: TicketStatus; priority?: TicketPriority; category?: string },
  ): Promise<Ticket[]> {
    const where: any = { tenantId };

    if (filters?.status) where.status = filters.status;
    if (filters?.priority) where.priority = filters.priority;
    if (filters?.category) where.category = filters.category;

    return this.ticketRepository.find({
      where,
      order: { createdAt: 'DESC' },
    });
  }

  async getTicketById(tenantId: string, id: string): Promise<Ticket> {
    const ticket = await this.ticketRepository.findOne({
      where: { id, tenantId },
    });

    if (!ticket) {
      throw new NotFoundException('Ticket not found');
    }

    return ticket;
  }

  async assignTicket(
    tenantId: string,
    ticketId: string,
    assignedTo: string,
    assignedToName: string,
  ): Promise<Ticket> {
    const ticket = await this.getTicketById(tenantId, ticketId);

    ticket.assignedTo = assignedTo;
    ticket.assignedToName = assignedToName;
    ticket.assignedAt = new Date();
    ticket.status = TicketStatus.IN_PROGRESS;

    return this.ticketRepository.save(ticket);
  }

  async updateTicketStatus(
    tenantId: string,
    ticketId: string,
    status: TicketStatus,
    userId?: string,
  ): Promise<Ticket> {
    const ticket = await this.getTicketById(tenantId, ticketId);

    ticket.status = status;

    if (status === TicketStatus.RESOLVED) {
      ticket.resolvedAt = new Date();
      ticket.resolvedBy = userId || '';
    } else if (status === TicketStatus.CLOSED) {
      ticket.closedAt = new Date();
      ticket.closedBy = userId || '';
    }

    return this.ticketRepository.save(ticket);
  }

  async updateTicketPriority(
    tenantId: string,
    ticketId: string,
    priority: TicketPriority,
  ): Promise<Ticket> {
    const ticket = await this.getTicketById(tenantId, ticketId);
    ticket.priority = priority;
    return this.ticketRepository.save(ticket);
  }

  async resolveTicket(
    tenantId: string,
    ticketId: string,
    resolution: string,
    resolvedBy: string,
  ): Promise<Ticket> {
    const ticket = await this.getTicketById(tenantId, ticketId);

    ticket.status = TicketStatus.RESOLVED;
    ticket.resolution = resolution;
    ticket.resolvedAt = new Date();
    ticket.resolvedBy = resolvedBy;

    return this.ticketRepository.save(ticket);
  }

  async closeTicket(tenantId: string, ticketId: string, closedBy: string): Promise<Ticket> {
    const ticket = await this.getTicketById(tenantId, ticketId);

    ticket.status = TicketStatus.CLOSED;
    ticket.closedAt = new Date();
    ticket.closedBy = closedBy;

    return this.ticketRepository.save(ticket);
  }

  async rateTicket(
    tenantId: string,
    ticketId: string,
    rating: number,
    feedback?: string,
  ): Promise<Ticket> {
    const ticket = await this.getTicketById(tenantId, ticketId);

    ticket.satisfactionRating = rating;
    ticket.feedback = feedback || '';

    return this.ticketRepository.save(ticket);
  }

  // ==================== RESPONSES ====================

  async addResponse(
    tenantId: string,
    ticketId: string,
    userId: string,
    userName: string,
    message: string,
    attachments?: string[],
    isInternal: boolean = false,
  ): Promise<TicketResponse> {
    const ticket = await this.getTicketById(tenantId, ticketId);

    const response = this.responseRepository.create({
      tenantId,
      ticketId,
      message,
      respondedBy: userId,
      respondedByName: userName,
      attachments,
      isInternal,
    });

    const savedResponse = await this.responseRepository.save(response);

    // Update ticket
    ticket.responseCount++;
    ticket.lastResponseAt = new Date();
    await this.ticketRepository.save(ticket);

    return savedResponse;
  }

  async getTicketResponses(tenantId: string, ticketId: string): Promise<TicketResponse[]> {
    return this.responseRepository.find({
      where: { tenantId, ticketId },
      order: { createdAt: 'ASC' },
    });
  }

  // ==================== STATISTICS ====================

  async getTicketStats(tenantId: string, userId?: string) {
    const where: any = { tenantId };
    if (userId) where.createdBy = userId;

    const tickets = await this.ticketRepository.find({ where });

    return {
      total: tickets.length,
      open: tickets.filter(t => t.status === TicketStatus.OPEN).length,
      inProgress: tickets.filter(t => t.status === TicketStatus.IN_PROGRESS).length,
      resolved: tickets.filter(t => t.status === TicketStatus.RESOLVED).length,
      closed: tickets.filter(t => t.status === TicketStatus.CLOSED).length,
      byCategory: this.groupByCategory(tickets),
      byPriority: this.groupByPriority(tickets),
      avgResolutionTime: this.calculateAvgResolutionTime(tickets),
      satisfactionRating: this.calculateAvgRating(tickets),
    };
  }

  // ==================== HELPER METHODS ====================

  private async generateTicketNumber(tenantId: string): Promise<string> {
    const count = await this.ticketRepository.count({ where: { tenantId } });
    const timestamp = Date.now().toString().slice(-6);
    return `TKT-${timestamp}-${(count + 1).toString().padStart(4, '0')}`;
  }

  private groupByCategory(tickets: Ticket[]) {
    const groups: any = {};
    tickets.forEach(ticket => {
      groups[ticket.category] = (groups[ticket.category] || 0) + 1;
    });
    return groups;
  }

  private groupByPriority(tickets: Ticket[]) {
    const groups: any = {};
    tickets.forEach(ticket => {
      groups[ticket.priority] = (groups[ticket.priority] || 0) + 1;
    });
    return groups;
  }

  private calculateAvgResolutionTime(tickets: Ticket[]): number {
    const resolved = tickets.filter(t => t.resolvedAt);
    if (resolved.length === 0) return 0;

    const totalMinutes = resolved.reduce((sum, ticket) => {
      const diff = ticket.resolvedAt.getTime() - new Date(ticket.createdAt).getTime();
      return sum + diff / (1000 * 60);
    }, 0);

    return Math.round(totalMinutes / resolved.length);
  }

  private calculateAvgRating(tickets: Ticket[]): number {
    const rated = tickets.filter(t => t.satisfactionRating);
    if (rated.length === 0) return 0;

    const totalRating = rated.reduce((sum, ticket) => sum + ticket.satisfactionRating, 0);
    return Math.round((totalRating / rated.length) * 10) / 10;
  }
}
