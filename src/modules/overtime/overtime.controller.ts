import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/enums/roles.enum';

@ApiTags('Overtime')
@ApiBearerAuth()
@Controller('overtime')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class OvertimeController {
  
  @Get('requests')
  @Roles(Role.ADMIN, Role.HR, Role.MANAGER)
  @ApiOperation({ summary: 'Get overtime requests' })
  async getOvertimeRequests(@Req() req: any, @Query('status') status?: string) {
    return [];
  }

  @Post('requests')
  @Roles(Role.ADMIN, Role.HR, Role.MANAGER, Role.EMPLOYEE)
  @ApiOperation({ summary: 'Create overtime request' })
  async createOvertimeRequest(@Body() dto: any) {
    return { id: 'new-overtime', ...dto };
  }

  @Put('requests/:id/approve')
  @Roles(Role.ADMIN, Role.HR, Role.MANAGER)
  @ApiOperation({ summary: 'Approve overtime request' })
  async approveOvertime(@Param('id') id: string) {
    return { id, status: 'approved' };
  }

  @Put('requests/:id/reject')
  @Roles(Role.ADMIN, Role.HR, Role.MANAGER)
  @ApiOperation({ summary: 'Reject overtime request' })
  async rejectOvertime(@Param('id') id: string) {
    return { id, status: 'rejected' };
  }
}
