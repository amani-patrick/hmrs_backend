import { Controller, Get, Post, Body, Query, UseGuards, ParseIntPipe } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { TenantId } from '../../common/decorators/tenant.decorator';
import { CalendarService } from './calendar.service';
import { CreateCalendarEventDto } from './dto/create-calendar-event.dto';
import { CalendarEvent } from './entities/calendar-event.entity';

@Controller('calendar')
@UseGuards(JwtAuthGuard)
export class CalendarController {
  constructor(private readonly calendarService: CalendarService) {}

  @Get('events')
  async getEvents(
    @TenantId() tenantId: string,
    @Query('start') start: string,
    @Query('end') end: string,
  ): Promise<CalendarEvent[]> {
    return this.calendarService.getEvents(
      tenantId,
      new Date(start),
      new Date(end),
    );
  }

  @Get('upcoming')
  async getUpcomingEvents(
    @TenantId() tenantId: string,
    @Query('limit', new ParseIntPipe({ optional: true })) limit: number = 10,
  ): Promise<CalendarEvent[]> {
    return this.calendarService.getUpcomingEvents(tenantId, limit);
  }

  @Post('events')
  async createEvent(
    @TenantId() tenantId: string,
    @Body() createDto: CreateCalendarEventDto,
  ): Promise<CalendarEvent> {
    return this.calendarService.createEvent(tenantId, createDto);
  }
}
