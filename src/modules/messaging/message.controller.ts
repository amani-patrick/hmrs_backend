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
import { MessageService } from './message.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { UpdateMessageDto } from './dto/update-message.dto';
import { MessageQueryDto } from './dto/message-query.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('messages')
@ApiBearerAuth()
@Controller('conversations/:conversationId/messages')
@UseGuards(JwtAuthGuard)
export class MessageController {
  constructor(private readonly messageService: MessageService) {}

  @Post()
  @ApiOperation({ summary: 'Send a message' })
  @ApiResponse({ status: 201, description: 'The message has been successfully sent.' })
  @ApiResponse({ status: 400, description: 'Bad request.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  async create(
    @TenantId() tenantId: string,
    @Param('conversationId', ParseUUIDPipe) conversationId: string,
    @UserId() userId: string,
    @Body() createMessageDto: CreateMessageDto,
  ) {
    return this.messageService.create(
      { ...createMessageDto, conversationId },
      userId,
      tenantId,
    );
  }

  @Get()
  @ApiOperation({ summary: 'Get messages in a conversation' })
  @ApiResponse({ status: 200, description: 'Return messages.' })
  async findAll(
    @TenantId() tenantId: string,
    @Param('conversationId', ParseUUIDPipe) conversationId: string,
    @UserId() userId: string,
    @Query() query: MessageQueryDto
  ) {
    return this.messageService.findAll(tenantId, conversationId, userId, query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a message by ID' })
  @ApiResponse({ status: 200, description: 'Return the message.' })
  @ApiResponse({ status: 404, description: 'Message not found.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  findOne(
    @TenantId() tenantId: string,
    @Param('conversationId', ParseUUIDPipe) conversationId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @UserId() userId: string
  ) {
    return this.messageService.findOne(tenantId, conversationId, id, userId);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a message' })
  @ApiResponse({ status: 200, description: 'The message has been successfully updated.' })
  @ApiResponse({ status: 400, description: 'Bad request.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 404, description: 'Message not found.' })
  update(
    @TenantId() tenantId: string,
    @Param('conversationId', ParseUUIDPipe) conversationId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @UserId() userId: string,
    @Body() updateMessageDto: UpdateMessageDto
  ) {
    return this.messageService.update(id, updateMessageDto, userId, tenantId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a message' })
  @ApiResponse({ status: 200, description: 'The message has been successfully deleted.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 404, description: 'Message not found.' })
  remove(
    @TenantId() tenantId: string,
    @Param('conversationId', ParseUUIDPipe) conversationId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @UserId() userId: string
  ) {
    return this.messageService.delete(id, userId, tenantId);
  }

  @Post(':id/react/:emoji')
  @ApiOperation({ summary: 'React to a message' })
  @ApiResponse({ status: 200, description: 'Reaction added/removed.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 404, description: 'Message not found.' })
  react(
    @TenantId() tenantId: string,
    @Param('conversationId', ParseUUIDPipe) conversationId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Param('emoji') emoji: string,
    @UserId() userId: string
  ) {
    return this.messageService.addReaction(tenantId, conversationId, id, emoji, userId);
  }

  @Post(':id/read')
  @ApiOperation({ summary: 'Mark a message as read' })
  @ApiResponse({ status: 200, description: 'Message marked as read.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 404, description: 'Message not found.' })
  markAsRead(
    @TenantId() tenantId: string,
    @Param('conversationId', ParseUUIDPipe) conversationId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @UserId() userId: string
  ) {
    return this.messageService.markAsRead(tenantId, conversationId, id, userId);
  }
}
