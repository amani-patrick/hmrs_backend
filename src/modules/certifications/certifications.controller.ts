import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, Req, ParseUUIDPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/enums/roles.enum';
import { CertificationsService } from './certifications.service';
import { CreateCertificationDto } from './dto/create-certification.dto';
import { UpdateCertificationDto } from './dto/update-certification.dto';

@ApiTags('Certifications')
@ApiBearerAuth()
@Controller('certifications')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class CertificationsController {
  constructor(private readonly certificationsService: CertificationsService) {}
  
  @Get()
  @Roles(Role.ADMIN, Role.HR, Role.MANAGER)
  @ApiOperation({ summary: 'Get all certifications' })
  @ApiResponse({ status: 200, description: 'Certifications retrieved successfully' })
  async getAllCertifications(@Req() req: any, @Query('status') status?: string) {
    return this.certificationsService.findAll(req.tenantId, status);
  }

  @Get(':id')
  @Roles(Role.ADMIN, Role.HR, Role.MANAGER)
  @ApiOperation({ summary: 'Get certification by ID' })
  @ApiResponse({ status: 200, description: 'Certification retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Certification not found' })
  async getCertification(@Req() req: any, @Param('id', ParseUUIDPipe) id: string) {
    return this.certificationsService.findOne(req.tenantId, id);
  }

  @Post()
  @Roles(Role.ADMIN, Role.HR)
  @ApiOperation({ summary: 'Create certification' })
  @ApiResponse({ status: 201, description: 'Certification created successfully' })
  async createCertification(@Req() req: any, @Body() dto: CreateCertificationDto) {
    return this.certificationsService.create(req.tenantId, dto);
  }

  @Put(':id')
  @Roles(Role.ADMIN, Role.HR)
  @ApiOperation({ summary: 'Update certification' })
  @ApiResponse({ status: 200, description: 'Certification updated successfully' })
  @ApiResponse({ status: 404, description: 'Certification not found' })
  async updateCertification(@Req() req: any, @Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateCertificationDto) {
    return this.certificationsService.update(req.tenantId, id, dto);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Delete certification' })
  @ApiResponse({ status: 200, description: 'Certification deleted successfully' })
  @ApiResponse({ status: 404, description: 'Certification not found' })
  async deleteCertification(@Req() req: any, @Param('id', ParseUUIDPipe) id: string) {
    return this.certificationsService.delete(req.tenantId, id);
  }
}
