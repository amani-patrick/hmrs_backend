import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  ParseUUIDPipe,
  BadRequestException,
  UploadedFile,
  UseInterceptors,
  Res,
  StreamableFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Response } from 'express';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { Role } from '../../common/enums/roles.enum';
import { DocumentsService } from './documents.service';
import { CreateDocumentDto } from './dto/create-document.dto';
import { CreatePolicyDto } from './dto/create-policy.dto';
import { CreateContractDto } from './dto/create-contract.dto';
import { AcknowledgePolicyDto } from './dto/acknowledge-policy.dto';
import { UpdateDocumentDto } from './dto/update-document.dto';

@Controller('documents')
@UseGuards(JwtAuthGuard)
export class DocumentsController {
  constructor(private readonly documentsService: DocumentsService) {}

  // Document Library Endpoints
  @Get('library/stats')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.HR, Role.MANAGER)
  async getDocumentLibraryStats() {
    return this.documentsService.getDocumentLibraryStats();
  }

  @Get('library')
  async getDocuments(@Query('category') category?: string) {
    // Add filtering logic based on user role and access rules
    return [];
  }

  @Post('library')
  @UseInterceptors(FileInterceptor('file'))
  async uploadDocument(
    @Request() req,
    @Body() createDocumentDto: CreateDocumentDto,
    @UploadedFile() file: any,
  ) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    // In a real app, upload the file to cloud storage here
    const fileUrl = `https://storage.example.com/documents/${file.originalname}`;
    
    const documentData: any = {
      ...createDocumentDto,
      fileUrl,
      fileSize: file.size,
      fileType: file.mimetype,
    };
    
    return this.documentsService.createDocument(
      documentData,
      req.user.id,
    );
  }

  @Get('library/:id')
  async getDocument(
    @Param('id', ParseUUIDPipe) id: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    const document = await this.documentsService.findDocumentById(id);
    
    // Update view count
    await this.documentsService.updateDocumentViews(id);
    
    // In a real app, stream the file from storage
    // For now, we'll just return the document metadata
    return document;
  }

  @Post('library/:id/download')
  async downloadDocument(
    @Param('id', ParseUUIDPipe) id: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    const document = await this.documentsService.findDocumentById(id);
    
    // Update download count
    await this.documentsService.updateDocumentDownloads(id);
    
    // In a real app, stream the file from storage
    // For now, we'll just return the document URL
    return { url: document.fileUrl };
  }

  // Policy Endpoints
  @Get('policies/stats')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.HR, Role.MANAGER)
  async getPolicyStats() {
    return this.documentsService.getPolicyStats();
  }

  @Get('policies')
  async getPolicies(@Query('status') status?: string) {
    // Add filtering and access control logic
    return [];
  }

  @Post('policies')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.HR)
  @UseInterceptors(FileInterceptor('file'))
  async createPolicy(
    @Request() req,
    @Body() createPolicyDto: CreatePolicyDto,
    @UploadedFile() file: any,
  ) {
    if (!file) {
      throw new BadRequestException('Policy document is required');
    }

    // Upload the policy document
    const fileUrl = `https://storage.example.com/policies/${file.originalname}`;
    
    // In a real app, you might want to create a document first, then link it to the policy
    return this.documentsService.createPolicy(
      {
        ...createPolicyDto,
        documentId: 'generated-document-id', // This should be the ID of the uploaded document
      },
      req.user.id,
    );
  }

  @Post('policies/:id/acknowledge')
  async acknowledgePolicy(
    @Request() req,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() acknowledgePolicyDto: AcknowledgePolicyDto,
  ) {
    return this.documentsService.acknowledgePolicy(
      id,
      req.user.id,
      {
        ...acknowledgePolicyDto,
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
      },
    );
  }

  // Contract Endpoints
  @Get('contracts/stats')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.HR, Role.MANAGER)
  async getContractStats() {
    return this.documentsService.getContractStats();
  }

  @Get('contracts')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.HR, Role.MANAGER)
  async getContracts(@Query('status') status?: string) {
    // Add filtering and access control logic
    return [];
  }

  @Post('contracts')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.HR)
  @UseInterceptors(FileInterceptor('file'))
  async createContract(
    @Request() req,
    @Body() createContractDto: CreateContractDto,
    @UploadedFile() file: any,
  ) {
    if (!file) {
      throw new BadRequestException('Contract document is required');
    }

    // Upload the contract document
    const fileUrl = `https://storage.example.com/contracts/${file.originalname}`;
    
    const contractData: any = {
      ...createContractDto,
      fileUrl,
    };
    
    return this.documentsService.createContract(
      contractData,
      req.user.id,
    );
  }

  // Template Endpoints
  @Get('templates')
  async getTemplates(@Query('category') category?: string) {
    return this.documentsService.getTemplates(category);
  }

  @Post('templates/:id/clone')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.HR, Role.MANAGER)
  async cloneTemplate(
    @Request() req,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateDocumentDto: UpdateDocumentDto,
  ) {
    return this.documentsService.createFromTemplate(id, req.user.id, updateDocumentDto);
  }
}
