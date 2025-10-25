import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Req, ParseUUIDPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiSecurity } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { DepartmentRealService } from './department.service';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/enums/roles.enum';

@ApiTags('Departments')
@ApiBearerAuth()
@ApiSecurity('tenant-id')
@Controller('departments')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class DepartmentController {
  constructor(private readonly departmentService: DepartmentRealService) {}

  @Get()
  @Roles(Role.ADMIN, Role.HR, Role.MANAGER)
  @ApiOperation({ summary: 'Get all departments' })
  @ApiResponse({ status: 200, description: 'Departments retrieved successfully' })
  async getAllDepartments(@Req() req: any) {
    return this.departmentService.findAll(req.tenantId);
  }

  @Get(':id')
  @Roles(Role.ADMIN, Role.HR, Role.MANAGER)
  @ApiOperation({ summary: 'Get department by ID' })
  @ApiResponse({ status: 200, description: 'Department retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Department not found' })
  async getDepartment(@Req() req: any, @Param('id', ParseUUIDPipe) id: string) {
    return this.departmentService.findOne(req.tenantId, id);
  }

  @Post()
  @Roles(Role.ADMIN, Role.HR)
  @ApiOperation({ summary: 'Create new department' })
  @ApiResponse({ status: 201, description: 'Department created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input' })
  async createDepartment(@Req() req: any, @Body() createDto: any) {
    return this.departmentService.create(req.tenantId, createDto);
  }

  @Put(':id')
  @Roles(Role.ADMIN, Role.HR)
  @ApiOperation({ summary: 'Update department' })
  @ApiResponse({ status: 200, description: 'Department updated successfully' })
  @ApiResponse({ status: 404, description: 'Department not found' })
  async updateDepartment(
    @Req() req: any,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateDto: any
  ) {
    return this.departmentService.update(req.tenantId, id, updateDto);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Delete department' })
  @ApiResponse({ status: 200, description: 'Department deleted successfully' })
  @ApiResponse({ status: 404, description: 'Department not found' })
  async deleteDepartment(@Req() req: any, @Param('id', ParseUUIDPipe) id: string) {
    return this.departmentService.delete(req.tenantId, id);
  }

  @Get(':id/stats')
  @Roles(Role.ADMIN, Role.HR, Role.MANAGER)
  @ApiOperation({ summary: 'Get department statistics' })
  @ApiResponse({ status: 200, description: 'Department stats retrieved successfully' })
  async getDepartmentStats(@Req() req: any, @Param('id', ParseUUIDPipe) id: string) {
    return this.departmentService.getStats(req.tenantId, id);
  }
}
