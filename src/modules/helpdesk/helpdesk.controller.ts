import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { HelpdeskService } from './helpdesk.service';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { TicketStatus, TicketPriority } from './entities/ticket.entity';

@ApiTags('Help Desk')
@ApiBearerAuth()
@Controller('helpdesk')
export class HelpdeskController {
  constructor(private readonly helpdeskService: HelpdeskService) {}

  // ==================== EMPLOYEE ENDPOINTS ====================

  @Post('tickets')
  @ApiOperation({ summary: 'Create support ticket' })
  @ApiResponse({ status: 201, description: 'Ticket created' })
  async createTicket(@Request() req, @Body() dto: CreateTicketDto) {
    return this.helpdeskService.createTicket(
      req.user.tenantId,
      req.user.userId,
      req.user.name || 'User',
      dto,
    );
  }

  @Get('tickets/my')
  @ApiOperation({ summary: 'Get my tickets' })
  @ApiQuery({ name: 'status', required: false, enum: TicketStatus })
  @ApiQuery({ name: 'category', required: false })
  @ApiResponse({ status: 200, description: 'List of my tickets' })
  async getMyTickets(
    @Request() req,
    @Query('status') status?: TicketStatus,
    @Query('category') category?: string,
  ) {
    return this.helpdeskService.getMyTickets(req.user.tenantId, req.user.userId, {
      status,
      category,
    });
  }

  @Get('tickets/my/stats')
  @ApiOperation({ summary: 'Get my ticket statistics' })
  @ApiResponse({ status: 200, description: 'Ticket statistics' })
  async getMyStats(@Request() req) {
    return this.helpdeskService.getTicketStats(req.user.tenantId, req.user.userId);
  }

  @Get('tickets/:id')
  @ApiOperation({ summary: 'Get ticket details' })
  @ApiResponse({ status: 200, description: 'Ticket details' })
  @ApiResponse({ status: 404, description: 'Ticket not found' })
  async getTicketById(@Request() req, @Param('id') id: string) {
    return this.helpdeskService.getTicketById(req.user.tenantId, id);
  }

  @Get('tickets/:id/responses')
  @ApiOperation({ summary: 'Get ticket responses/comments' })
  @ApiResponse({ status: 200, description: 'Ticket responses' })
  async getTicketResponses(@Request() req, @Param('id') id: string) {
    return this.helpdeskService.getTicketResponses(req.user.tenantId, id);
  }

  @Post('tickets/:id/responses')
  @ApiOperation({ summary: 'Add response to ticket' })
  @ApiResponse({ status: 201, description: 'Response added' })
  async addResponse(
    @Request() req,
    @Param('id') id: string,
    @Body('message') message: string,
    @Body('attachments') attachments?: string[],
  ) {
    return this.helpdeskService.addResponse(
      req.user.tenantId,
      id,
      req.user.userId,
      req.user.name || 'User',
      message,
      attachments,
      false,
    );
  }

  @Post('tickets/:id/rate')
  @ApiOperation({ summary: 'Rate ticket resolution' })
  @ApiResponse({ status: 200, description: 'Ticket rated' })
  async rateTicket(
    @Request() req,
    @Param('id') id: string,
    @Body('rating') rating: number,
    @Body('feedback') feedback?: string,
  ) {
    return this.helpdeskService.rateTicket(req.user.tenantId, id, rating, feedback);
  }

  // ==================== SUPPORT STAFF ENDPOINTS ====================

  @Get('admin/tickets')
  @ApiOperation({ summary: 'Get all tickets (Support/Admin)' })
  @ApiQuery({ name: 'status', required: false, enum: TicketStatus })
  @ApiQuery({ name: 'priority', required: false, enum: TicketPriority })
  @ApiQuery({ name: 'category', required: false })
  @ApiResponse({ status: 200, description: 'All tickets' })
  async getAllTickets(
    @Request() req,
    @Query('status') status?: TicketStatus,
    @Query('priority') priority?: TicketPriority,
    @Query('category') category?: string,
  ) {
    return this.helpdeskService.getAllTickets(req.user.tenantId, {
      status,
      priority,
      category,
    });
  }

  @Get('admin/tickets/assigned')
  @ApiOperation({ summary: 'Get tickets assigned to me (Support)' })
  @ApiQuery({ name: 'status', required: false, enum: TicketStatus })
  @ApiResponse({ status: 200, description: 'Assigned tickets' })
  async getAssignedTickets(@Request() req, @Query('status') status?: TicketStatus) {
    return this.helpdeskService.getAssignedTickets(req.user.tenantId, req.user.userId, {
      status,
    });
  }

  @Get('admin/tickets/stats')
  @ApiOperation({ summary: 'Get overall ticket statistics (Admin)' })
  @ApiResponse({ status: 200, description: 'Overall statistics' })
  async getOverallStats(@Request() req) {
    return this.helpdeskService.getTicketStats(req.user.tenantId);
  }

  @Patch('admin/tickets/:id/assign')
  @ApiOperation({ summary: 'Assign ticket to support staff' })
  @ApiResponse({ status: 200, description: 'Ticket assigned' })
  async assignTicket(
    @Request() req,
    @Param('id') id: string,
    @Body('assignedTo') assignedTo: string,
    @Body('assignedToName') assignedToName: string,
  ) {
    return this.helpdeskService.assignTicket(req.user.tenantId, id, assignedTo, assignedToName);
  }

  @Patch('admin/tickets/:id/status')
  @ApiOperation({ summary: 'Update ticket status' })
  @ApiResponse({ status: 200, description: 'Status updated' })
  async updateStatus(
    @Request() req,
    @Param('id') id: string,
    @Body('status') status: TicketStatus,
  ) {
    return this.helpdeskService.updateTicketStatus(req.user.tenantId, id, status, req.user.userId);
  }

  @Patch('admin/tickets/:id/priority')
  @ApiOperation({ summary: 'Update ticket priority' })
  @ApiResponse({ status: 200, description: 'Priority updated' })
  async updatePriority(
    @Request() req,
    @Param('id') id: string,
    @Body('priority') priority: TicketPriority,
  ) {
    return this.helpdeskService.updateTicketPriority(req.user.tenantId, id, priority);
  }

  @Post('admin/tickets/:id/resolve')
  @ApiOperation({ summary: 'Resolve ticket with solution' })
  @ApiResponse({ status: 200, description: 'Ticket resolved' })
  async resolveTicket(
    @Request() req,
    @Param('id') id: string,
    @Body('resolution') resolution: string,
  ) {
    return this.helpdeskService.resolveTicket(req.user.tenantId, id, resolution, req.user.userId);
  }

  @Post('admin/tickets/:id/close')
  @ApiOperation({ summary: 'Close ticket' })
  @ApiResponse({ status: 200, description: 'Ticket closed' })
  async closeTicket(@Request() req, @Param('id') id: string) {
    return this.helpdeskService.closeTicket(req.user.tenantId, id, req.user.userId);
  }

  @Post('admin/tickets/:id/responses/internal')
  @ApiOperation({ summary: 'Add internal note to ticket' })
  @ApiResponse({ status: 201, description: 'Internal note added' })
  async addInternalNote(
    @Request() req,
    @Param('id') id: string,
    @Body('message') message: string,
  ) {
    return this.helpdeskService.addResponse(
      req.user.tenantId,
      id,
      req.user.userId,
      req.user.name || 'Staff',
      message,
      undefined,
      true,
    );
  }
}
