import { 
    Controller, 
    Get, 
    Post, 
    Body, 
    Param, 
    UseGuards, 
    Request, 
    ParseUUIDPipe,
    BadRequestException,
    NotFoundException,
    HttpStatus,
    HttpCode,
    Query
  } from '@nestjs/common';
  import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam, ApiQuery } from '@nestjs/swagger';
  import { TimeService } from './time.service';
  import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
  import { RolesGuard } from '../../auth/guards/roles.guard';
  import { Roles } from '../../auth/decorators/roles.decorator';
  import { Role } from '../../common/enums/roles.enum';
  import { CreateTimeEntryDto } from './dto/create-time-entry.dto';
  import { CreateOvertimeRequestDto } from './dto/create-overtime-request.dto';
  import { UpdateOvertimeRequestDto } from './dto/update-overtime-request.dto';
  import { TimeEntry } from './entities/time-entry.entity';
  import { OvertimeRequest } from './entities/overtime-request.entity';
  
  @ApiTags('Time Management')
  @ApiBearerAuth()
  @Controller('time')
  @UseGuards(JwtAuthGuard)
  export class TimeController {
    constructor(private readonly timeService: TimeService) {}
  
    @Post('clock-in')
    @ApiOperation({ summary: 'Clock in for work' })
    @ApiResponse({ status: HttpStatus.CREATED, description: 'Successfully clocked in', type: TimeEntry })
    @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Invalid input data' })
    @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized' })
    async clockIn(
      @Request() req,
      @Body() createTimeEntryDto: CreateTimeEntryDto
    ): Promise<TimeEntry> {
      try {
        return await this.timeService.clockIn(req.user.id, createTimeEntryDto);
      } catch (error) {
        throw new BadRequestException(error.message);
      }
    }
  
    @Post('clock-out/:entryId')
    @ApiOperation({ summary: 'Clock out from work' })
    @ApiParam({ name: 'entryId', description: 'Time entry ID' })
    @ApiResponse({ status: HttpStatus.OK, description: 'Successfully clocked out', type: TimeEntry })
    @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Time entry not found' })
    @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Invalid operation' })
    async clockOut(
      @Request() req,
      @Param('entryId', ParseUUIDPipe) entryId: string
    ): Promise<TimeEntry> {
      try {
        return await this.timeService.clockOut(req.user.id, entryId);
      } catch (error) {
        if (error instanceof NotFoundException) {
          throw error;
        }
        throw new BadRequestException('Failed to process clock out');
      }
    }
  
    @Get('tracking/stats/today')
    @ApiOperation({ summary: 'Get today\'s time tracking statistics' })
    @ApiResponse({ status: HttpStatus.OK, description: 'Returns time tracking stats' })
    async getTimeTrackingStats(@Request() req) {
      try {
        return await this.timeService.getTimeTrackingStats(req.user.id);
      } catch (error) {
        throw new BadRequestException('Failed to fetch time tracking stats');
      }
    }
  
    @Get('tracking/summary/projects')
    @UseGuards(RolesGuard)
    @Roles(Role.ADMIN, Role.MANAGER)
    @ApiOperation({ summary: 'Get project hours summary (Admin/Manager only)' })
    @ApiQuery({ name: 'startDate', required: false, type: Date })
    @ApiQuery({ name: 'endDate', required: false, type: Date })
    @ApiResponse({ status: HttpStatus.OK, description: 'Returns project hours summary' })
    async getProjectHoursSummary(
      @Query('startDate') startDate?: Date,
      @Query('endDate') endDate?: Date
    ) {
      try {
        return await this.timeService.getProjectHoursSummary({ startDate, endDate });
      } catch (error) {
        throw new BadRequestException('Failed to fetch project hours summary');
      }
    }
  
    @Post('overtime/request')
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({ summary: 'Submit overtime request' })
    @ApiResponse({ status: HttpStatus.CREATED, description: 'Overtime request submitted', type: OvertimeRequest })
    async requestOvertime(
      @Request() req,
      @Body() createOvertimeRequestDto: CreateOvertimeRequestDto
    ): Promise<OvertimeRequest> {
      try {
        return await this.timeService.createOvertimeRequest(
          req.user.id,
          createOvertimeRequestDto
        );
      } catch (error) {
        throw new BadRequestException('Failed to create overtime request');
      }
    }
  
    @Post('overtime/:id/approve')
    @UseGuards(RolesGuard)
    @Roles(Role.ADMIN, Role.MANAGER)
    @ApiOperation({ summary: 'Approve overtime request (Admin/Manager only)' })
    @ApiParam({ name: 'id', description: 'Overtime request ID' })
    @ApiResponse({ status: HttpStatus.OK, description: 'Overtime request approved' })
    async approveOvertimeRequest(
      @Param('id', ParseUUIDPipe) id: string,
      @Request() req,
      @Body() updateOvertimeRequestDto: UpdateOvertimeRequestDto
    ) {
      try {
        return await this.timeService.updateOvertimeRequestStatus(
          id,
          { ...updateOvertimeRequestDto, status: 'approved' },
          req.user.id
        );
      } catch (error) {
        throw new BadRequestException('Failed to approve overtime request');
      }
    }
  
    @Get('overtime/requests')
    @ApiOperation({ summary: 'Get user\'s overtime requests' })
    @ApiQuery({ name: 'status', required: false, enum: ['pending', 'approved', 'rejected'] })
    @ApiResponse({ status: HttpStatus.OK, description: 'Returns list of overtime requests' })
    async getUserOvertimeRequests(
      @Request() req,
      @Query('status') status?: string
    ) {
      try {
        return await this.timeService.getUserOvertimeRequests(req.user.id, status);
      } catch (error) {
        throw new BadRequestException('Failed to fetch overtime requests');
      }
    }
  }