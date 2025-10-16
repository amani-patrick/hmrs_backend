import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, FindOptionsWhere, In, Repository } from 'typeorm';
import { CalendarEvent, EventStatus } from './entities/calendar-event.entity';
import { CreateCalendarEventDto } from './dto/create-calendar-event.dto';
import { UpdateCalendarEventDto } from './dto/update-calendar-event.dto';

@Injectable()
export class CalendarService {
  constructor(
    @InjectRepository(CalendarEvent)
    private readonly eventRepository: Repository<CalendarEvent>,
  ) {}

  async getEvents(
    tenantId: string,
    start: Date,
    end: Date,
  ): Promise<CalendarEvent[]> {
    return this.eventRepository.find({
      where: {
        tenantId,
        startTime: Between(start, end),
        status: In([EventStatus.SCHEDULED, undefined]),
      },
      order: { startTime: 'ASC' },
    });
  }

  async getUpcomingEvents(
    tenantId: string,
    limit: number = 10,
  ): Promise<CalendarEvent[]> {
    const now = new Date();
    return this.eventRepository.find({
      where: {
        tenantId,
        startTime: Between(now, new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)),
        status: In([EventStatus.SCHEDULED, undefined]),
      },
      order: { startTime: 'ASC' },
      take: limit,
    });
  }

  async getEventById(
    tenantId: string,
    eventId: string,
  ): Promise<CalendarEvent> {
    const event = await this.eventRepository.findOne({
      where: { id: eventId, tenantId },
    });

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    return event;
  }

  async createEvent(
    tenantId: string,
    createDto: CreateCalendarEventDto,
    createdById?: string,
  ): Promise<CalendarEvent> {
    const event = this.eventRepository.create({
      ...createDto,
      tenantId,
      status: EventStatus.SCHEDULED,
      createdById,
      updatedById: createdById,
    });

    return this.eventRepository.save(event);
  }

  async updateEvent(
    tenantId: string,
    eventId: string,
    updateDto: UpdateCalendarEventDto,
    updatedById?: string,
  ): Promise<CalendarEvent> {
    const event = await this.getEventById(tenantId, eventId);
    
    // Prevent modifying certain fields
    const { id, tenantId: _, ...updateData } = updateDto as any;
    
    Object.assign(event, {
      ...updateData,
      updatedById,
      updatedAt: new Date(),
    });

    return this.eventRepository.save(event);
  }

  async deleteEvent(
    tenantId: string,
    eventId: string,
  ): Promise<void> {
    const event = await this.getEventById(tenantId, eventId);
    await this.eventRepository.remove(event);
  }

  async cancelEvent(
    tenantId: string,
    eventId: string,
    cancelledById?: string,
  ): Promise<CalendarEvent> {
    const event = await this.getEventById(tenantId, eventId);
    
    if (event.status === EventStatus.CANCELLED) {
      throw new ForbiddenException('Event is already cancelled');
    }

    event.status = EventStatus.CANCELLED;
    event.updatedById = cancelledById;
    event.updatedAt = new Date();

    return this.eventRepository.save(event);
  }

  async getEventsForUser(
    tenantId: string,
    userId: string,
    start: Date,
    end: Date,
  ): Promise<CalendarEvent[]> {
    return this.eventRepository
      .createQueryBuilder('event')
      .where('event.tenantId = :tenantId', { tenantId })
      .andWhere('event.startTime BETWEEN :start AND :end', { start, end })
      .andWhere('(event.status IS NULL OR event.status = :status)', { 
        status: EventStatus.SCHEDULED 
      })
      .andWhere('(event.attendees @> :attendee OR event.createdById = :userId)', {
        attendee: JSON.stringify([{ id: userId }]),
        userId,
      })
      .orderBy('event.startTime', 'ASC')
      .getMany();
  }
