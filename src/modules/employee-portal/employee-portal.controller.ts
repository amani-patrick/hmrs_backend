import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { EmployeePortalService } from './employee-portal.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UploadDocumentDto } from './dto/upload-document.dto';
import { DocumentStatus } from './entities/employee-document.entity';

@ApiTags('Employee Portal')
@ApiBearerAuth()
@Controller('employee-portal')
export class EmployeePortalController {
  constructor(private readonly employeePortalService: EmployeePortalService) {}

  // ==================== PROFILE ENDPOINTS ====================

  @Get('profile/me')
  @ApiOperation({ summary: 'Get my complete profile' })
  @ApiResponse({ status: 200, description: 'Employee profile' })
  async getMyProfile(@Request() req) {
    return this.employeePortalService.getMyProfile(req.user.tenantId, req.user.userId);
  }

  @Put('profile/me')
  @ApiOperation({ summary: 'Update my profile' })
  @ApiResponse({ status: 200, description: 'Profile updated' })
  async updateMyProfile(@Request() req, @Body() dto: UpdateProfileDto) {
    return this.employeePortalService.updateMyProfile(req.user.tenantId, req.user.userId, dto);
  }

  @Get('profile/completion')
  @ApiOperation({ summary: 'Get profile completion status' })
  @ApiResponse({ status: 200, description: 'Profile completion details' })
  async getProfileCompletion(@Request() req) {
    return this.employeePortalService.getProfileCompletionStatus(
      req.user.tenantId,
      req.user.userId,
    );
  }

  // ==================== DOCUMENT ENDPOINTS ====================

  @Post('documents')
  @ApiOperation({ summary: 'Upload a document' })
  @ApiResponse({ status: 201, description: 'Document uploaded' })
  async uploadDocument(@Request() req, @Body() dto: UploadDocumentDto) {
    return this.employeePortalService.uploadDocument(req.user.tenantId, req.user.userId, dto);
  }

  @Get('documents')
  @ApiOperation({ summary: 'Get my documents' })
  @ApiQuery({ name: 'category', required: false })
  @ApiQuery({ name: 'status', required: false, enum: DocumentStatus })
  @ApiResponse({ status: 200, description: 'List of documents' })
  async getMyDocuments(
    @Request() req,
    @Query('category') category?: string,
    @Query('status') status?: DocumentStatus,
  ) {
    return this.employeePortalService.getMyDocuments(req.user.tenantId, req.user.userId, {
      category,
      status,
    });
  }

  @Get('documents/stats')
  @ApiOperation({ summary: 'Get document statistics' })
  @ApiResponse({ status: 200, description: 'Document statistics' })
  async getDocumentStats(@Request() req) {
    return this.employeePortalService.getDocumentStats(req.user.tenantId, req.user.userId);
  }

  @Get('documents/:id')
  @ApiOperation({ summary: 'Get document by ID' })
  @ApiResponse({ status: 200, description: 'Document details' })
  @ApiResponse({ status: 404, description: 'Document not found' })
  async getDocumentById(@Request() req, @Param('id') id: string) {
    return this.employeePortalService.getDocumentById(req.user.tenantId, req.user.userId, id);
  }

  @Delete('documents/:id')
  @ApiOperation({ summary: 'Delete my document' })
  @ApiResponse({ status: 200, description: 'Document deleted' })
  @ApiResponse({ status: 404, description: 'Document not found' })
  async deleteDocument(@Request() req, @Param('id') id: string) {
    await this.employeePortalService.deleteDocument(req.user.tenantId, req.user.userId, id);
    return { message: 'Document deleted successfully' };
  }

  // ==================== HR REVIEW ENDPOINTS ====================

  @Post('admin/documents/:id/review')
  @ApiOperation({ summary: 'Review employee document (HR/Admin)' })
  @ApiResponse({ status: 200, description: 'Document reviewed' })
  async reviewDocument(
    @Request() req,
    @Param('id') id: string,
    @Body('status') status: DocumentStatus,
    @Body('notes') notes?: string,
    @Body('rejectionReason') rejectionReason?: string,
  ) {
    return this.employeePortalService.reviewDocument(
      req.user.tenantId,
      id,
      req.user.userId,
      status,
      notes,
      rejectionReason,
    );
  }

  @Get('admin/documents/pending')
  @ApiOperation({ summary: 'Get all pending documents for review (HR/Admin)' })
  @ApiResponse({ status: 200, description: 'Pending documents' })
  async getPendingDocuments(@Request() req) {
    return this.employeePortalService.getPendingDocuments(req.user.tenantId);
  }

  @Get('admin/documents/expiring')
  @ApiOperation({ summary: 'Get expiring documents (HR/Admin)' })
  @ApiQuery({ name: 'days', required: false, description: 'Days until expiry (default 30)' })
  @ApiResponse({ status: 200, description: 'Expiring documents' })
  async getExpiringDocuments(@Request() req, @Query('days') days?: number) {
    return this.employeePortalService.getExpiringDocuments(
      req.user.tenantId,
      days ? parseInt(days.toString()) : 30,
    );
  }
}
