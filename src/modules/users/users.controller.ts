import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  HttpCode,
  HttpStatus,
  UseGuards,
  Request,
  ParseUUIDPipe,
  Logger,
  UsePipes,
  ValidationPipe,
  NotFoundException
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';

import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/enums/roles.enum';
import { UsersService } from './users.service';
import { JwtPayload } from '../../auth/interfaces/jwt-payload.interface';
import { CreateUserDto } from './dto/create-user.dto';
import { UserResponseDto } from './dto/user-response.dto';
import { EmployeeStatsResponseDto } from './dto/employee-stats-response.dto';

@ApiTags('Users & Employees')
@ApiBearerAuth()
@Controller()
@UseGuards(AuthGuard('jwt'), RolesGuard)
@UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
export class UsersController {
  private readonly logger = new Logger(UsersController.name);

  constructor(private readonly usersService: UsersService) {}

  @Get('users')
  @Roles(Role.ADMIN, Role.HR, Role.MANAGER)
  @ApiOperation({ summary: 'Get all users in the current tenant' })
  @ApiResponse({ status: 200, description: 'List of users', type: [UserResponseDto] })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async findAllUsers(@Request() req: { user: JwtPayload }): Promise<UserResponseDto[]> {
    this.logger.log(`Fetching all users for tenant: ${req.user.tenantId} by ${req.user.email}`);
    return this.usersService.findAllUsersInTenant();
  }

  @Get('users/:id')
  @Roles(Role.ADMIN, Role.HR, Role.MANAGER)
  @ApiOperation({ summary: 'Get a user by ID' })
  @ApiParam({ name: 'id', description: 'User ID (UUID)' })
  @ApiResponse({ status: 200, description: 'User found', type: UserResponseDto })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async findUserById(
    @Param('id', ParseUUIDPipe) id: string,
    @Request() req: { user: JwtPayload }
  ): Promise<UserResponseDto> {
    this.logger.log(`Fetching user ${id} requested by ${req.user.email}`);
    const user = await this.usersService.findOneById(id);
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return user;
  }

  @Get('employees')
  @Roles(Role.ADMIN, Role.HR)
  @ApiOperation({ summary: 'Get all employees' })
  @ApiResponse({ status: 200, description: 'List of employees', type: [UserResponseDto] })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async findAllEmployees(): Promise<UserResponseDto[]> {
    this.logger.log('Fetching all employees');
    return this.usersService.findAllEmployees();
  }

  @Get('employees/stats')
  @Roles(Role.ADMIN, Role.HR)
  @ApiOperation({ summary: 'Get employee statistics' })
  @ApiResponse({ status: 200, description: 'Employee statistics', type: EmployeeStatsResponseDto })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async getEmployeeStats(
    @Request() req: { user: JwtPayload }
  ): Promise<EmployeeStatsResponseDto> {
    this.logger.log(`Fetching employee stats by ${req.user.email}`);
    return this.usersService.getEmployeeStats(new Date());
  }

  @Post('employees/invite')
  @Roles(Role.ADMIN, Role.HR)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Invite a new employee' })
  @ApiResponse({ status: 201, description: 'Employee invited successfully', type: UserResponseDto })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async inviteEmployee(
    @Body() createUserDto: CreateUserDto,
    @Request() req: { user: JwtPayload }
  ): Promise<UserResponseDto> {
    this.logger.log(`Inviting new employee by ${req.user.email}`);
    return this.usersService.createInvitedUser(createUserDto);
  }

  @Post('employees/:id/terminate')
  @Roles(Role.ADMIN, Role.HR)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Terminate an employee' })
  @ApiParam({ name: 'id', description: 'Employee ID (UUID)' })
  @ApiResponse({ status: 204, description: 'Employee terminated successfully' })
  @ApiResponse({ status: 404, description: 'Employee not found' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async terminateEmployee(
    @Param('id', ParseUUIDPipe) id: string,
    @Request() req: { user: JwtPayload }
  ): Promise<void> {
    this.logger.log(`Terminating employee ${id} by ${req.user.email}`);
    const result = await this.usersService.deactivateUser(id);
    if (!result) {
      throw new NotFoundException(`Employee with ID ${id} not found`);
    }
  }
}