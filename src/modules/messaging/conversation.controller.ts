import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Param, 
  Query, 
  UseGuards, 
  ParseUUIDPipe,
  Delete,
  Put
} from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { TenantId } from '../../common/decorators/tenant.decorator';
import { UserId } from '../../common/decorators/user.decorator';
import { ConversationService } from './conversation.service';
import { CreateConversationDto } from './dto/create-conversation.dto';
import { UpdateConversationDto } from './dto/update-conversation.dto';
import { ConversationQueryDto } from './dto/conversation-query.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('conversations')
@ApiBearerAuth()
@Controller('conversations')
@UseGuards(JwtAuthGuard)
export class ConversationController {
  constructor(private readonly conversationService: ConversationService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new conversation' })
  @ApiResponse({ status: 201, description: 'The conversation has been successfully created.' })
  @ApiResponse({ status: 400, description: 'Bad request.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  create(
    @TenantId() tenantId: string,
    @UserId() userId: string,
    @Body() createConversationDto: CreateConversationDto
  ) {
    return this.conversationService.create(tenantId, createConversationDto, userId);
  }

  @Get()
  @ApiOperation({ summary: 'Get all conversations for the current user' })
  @ApiResponse({ status: 200, description: 'Return all conversations.' })
  async findAll(
    @TenantId() tenantId: string,
    @UserId() userId: string,
    @Query() query: ConversationQueryDto
  ) {
    return this.conversationService.findAll(tenantId, userId, query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a conversation by ID' })
  @ApiResponse({ status: 200, description: 'Return the conversation.' })
  @ApiResponse({ status: 404, description: 'Conversation not found.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  async findOne(
    @TenantId() tenantId: string,
    @Param('id') id: string,
    @UserId() userId: string
  ) {
    return this.conversationService.findOne(id, tenantId);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a conversation' })
  @ApiResponse({ status: 200, description: 'The conversation has been successfully updated.' })
  @ApiResponse({ status: 400, description: 'Bad request.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 404, description: 'Conversation not found.' })
  async update(
    @Param('id') id: string,
    @Body() updateConversationDto: UpdateConversationDto,
    @UserId() userId: string,
    @TenantId() tenantId: string
  ) {
    return this.conversationService.update(id, updateConversationDto, userId, tenantId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a conversation' })
  @ApiResponse({ status: 200, description: 'The conversation has been successfully deleted.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 404, description: 'Conversation not found.' })
  async remove(
    @Param('id') id: string,
    @UserId() userId: string,
    @TenantId() tenantId: string
  ) {
    await this.conversationService.remove(id, userId, tenantId);
    return { message: 'Conversation deleted successfully' };
  }

  @Post(':id/read')
  @ApiOperation({ summary: 'Mark all messages in a conversation as read' })
  @ApiResponse({ status: 200, description: 'Marked as read.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 404, description: 'Conversation not found.' })
  async markAsRead(
    @Param('id') id: string,
    @UserId() userId: string,
    @TenantId() tenantId: string
  ) {
    await this.conversationService.markAsRead(id, userId, tenantId);
    return { message: 'Conversation marked as read' };
  }
}
