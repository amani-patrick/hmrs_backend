import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { OnboardingService } from './onboarding.service';
import { CreateOnboardingDto } from './dto/create-onboarding.dto';
import { CreateOffboardingDto } from './dto/create-offboarding.dto';
import { UpdateChecklistItemDto } from './dto/update-checklist.dto';
import { CompleteExitInterviewDto } from './dto/complete-exit-interview.dto';
import { OnboardingStatus, OnboardingStage } from './entities/onboarding-process.entity';
import { OffboardingStatus } from './entities/offboarding-process.entity';

@ApiTags('Onboarding/Offboarding')
@ApiBearerAuth()
@Controller('onboarding')
export class OnboardingController {
  constructor(private readonly onboardingService: OnboardingService) {}

  // ==================== ONBOARDING ENDPOINTS ====================

  @Post()
  @ApiOperation({ summary: 'Create new onboarding process' })
  @ApiResponse({ status: 201, description: 'Onboarding process created' })
  async createOnboarding(@Request() req, @Body() dto: CreateOnboardingDto) {
    return this.onboardingService.createOnboarding(req.user.tenantId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all onboarding processes' })
  @ApiQuery({ name: 'status', required: false, enum: OnboardingStatus })
  @ApiQuery({ name: 'stage', required: false, enum: OnboardingStage })
  @ApiResponse({ status: 200, description: 'List of onboarding processes' })
  async getAllOnboardings(
    @Request() req,
    @Query('status') status?: OnboardingStatus,
    @Query('stage') stage?: OnboardingStage,
  ) {
    return this.onboardingService.getAllOnboardings(req.user.tenantId, { status, stage });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get onboarding process by ID' })
  @ApiResponse({ status: 200, description: 'Onboarding process details' })
  @ApiResponse({ status: 404, description: 'Onboarding process not found' })
  async getOnboardingById(@Request() req, @Param('id') id: string) {
    return this.onboardingService.getOnboardingById(req.user.tenantId, id);
  }

  @Patch(':id/checklist')
  @ApiOperation({ summary: 'Update onboarding checklist item' })
  @ApiResponse({ status: 200, description: 'Checklist item updated' })
  async updateChecklistItem(
    @Request() req,
    @Param('id') id: string,
    @Body() dto: UpdateChecklistItemDto,
  ) {
    return this.onboardingService.updateChecklistItem(req.user.tenantId, id, dto, req.user.userId);
  }

  @Patch(':id/stage')
  @ApiOperation({ summary: 'Update onboarding stage' })
  @ApiResponse({ status: 200, description: 'Onboarding stage updated' })
  async updateStage(
    @Request() req,
    @Param('id') id: string,
    @Body('stage') stage: OnboardingStage,
  ) {
    return this.onboardingService.updateOnboardingStage(req.user.tenantId, id, stage);
  }

  @Patch(':id/documents/:documentName')
  @ApiOperation({ summary: 'Mark document as received' })
  @ApiResponse({ status: 200, description: 'Document marked as received' })
  async markDocumentReceived(
    @Request() req,
    @Param('id') id: string,
    @Param('documentName') documentName: string,
  ) {
    return this.onboardingService.markDocumentReceived(req.user.tenantId, id, documentName);
  }

  @Patch(':id/equipment/:itemName')
  @ApiOperation({ summary: 'Update equipment status' })
  @ApiResponse({ status: 200, description: 'Equipment status updated' })
  async updateEquipmentStatus(
    @Request() req,
    @Param('id') id: string,
    @Param('itemName') itemName: string,
    @Body('status') status: 'pending' | 'delivered' | 'returned',
  ) {
    return this.onboardingService.updateEquipmentStatus(req.user.tenantId, id, itemName, status);
  }

  // ==================== OFFBOARDING ENDPOINTS ====================

  @Post('offboarding')
  @ApiOperation({ summary: 'Initiate offboarding process' })
  @ApiResponse({ status: 201, description: 'Offboarding process initiated' })
  async createOffboarding(@Request() req, @Body() dto: CreateOffboardingDto) {
    return this.onboardingService.createOffboarding(req.user.tenantId, req.user.userId, dto);
  }

  @Get('offboarding/all')
  @ApiOperation({ summary: 'Get all offboarding processes' })
  @ApiQuery({ name: 'status', required: false, enum: OffboardingStatus })
  @ApiResponse({ status: 200, description: 'List of offboarding processes' })
  async getAllOffboardings(
    @Request() req,
    @Query('status') status?: OffboardingStatus,
  ) {
    return this.onboardingService.getAllOffboardings(req.user.tenantId, { status });
  }

  @Get('offboarding/:id')
  @ApiOperation({ summary: 'Get offboarding process by ID' })
  @ApiResponse({ status: 200, description: 'Offboarding process details' })
  @ApiResponse({ status: 404, description: 'Offboarding process not found' })
  async getOffboardingById(@Request() req, @Param('id') id: string) {
    return this.onboardingService.getOffboardingById(req.user.tenantId, id);
  }

  @Patch('offboarding/:id/checklist')
  @ApiOperation({ summary: 'Update offboarding checklist item' })
  @ApiResponse({ status: 200, description: 'Checklist item updated' })
  async updateOffboardingChecklistItem(
    @Request() req,
    @Param('id') id: string,
    @Body() dto: UpdateChecklistItemDto,
  ) {
    return this.onboardingService.updateOffboardingChecklistItem(
      req.user.tenantId,
      id,
      dto,
      req.user.userId,
    );
  }

  @Post('offboarding/:id/exit-interview')
  @ApiOperation({ summary: 'Complete exit interview' })
  @ApiResponse({ status: 200, description: 'Exit interview completed' })
  async completeExitInterview(
    @Request() req,
    @Param('id') id: string,
    @Body() dto: CompleteExitInterviewDto,
  ) {
    return this.onboardingService.completeExitInterview(
      req.user.tenantId,
      id,
      dto.notes,
      dto.rating,
      dto.wouldRehire,
    );
  }

  @Patch('offboarding/:id/access/:systemName')
  @ApiOperation({ summary: 'Revoke system access' })
  @ApiResponse({ status: 200, description: 'Access revoked' })
  async revokeAccess(
    @Request() req,
    @Param('id') id: string,
    @Param('systemName') systemName: string,
  ) {
    return this.onboardingService.revokeAccess(
      req.user.tenantId,
      id,
      systemName,
      req.user.userId,
    );
  }

  @Patch('offboarding/:id/equipment/:itemName/return')
  @ApiOperation({ summary: 'Mark equipment as returned' })
  @ApiResponse({ status: 200, description: 'Equipment marked as returned' })
  async markEquipmentReturned(
    @Request() req,
    @Param('id') id: string,
    @Param('itemName') itemName: string,
    @Body('condition') condition: string,
  ) {
    return this.onboardingService.markEquipmentReturned(
      req.user.tenantId,
      id,
      itemName,
      condition,
    );
  }
}
