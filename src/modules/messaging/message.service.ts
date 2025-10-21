import { 
  Injectable, 
  NotFoundException, 
  BadRequestException, 
  Inject, 
  forwardRef,
  Logger 
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Message, MessageType } from './entities/message.entity';
import { CreateMessageDto } from './dto/create-message.dto';
import { UpdateMessageDto } from './dto/update-message.dto';
import { MessageQueryDto } from './dto/message-query.dto';
import { ConversationService } from './conversation.service';
import { MessagingGateway } from './gateways/messaging.gateway';

@Injectable()
export class MessageService {
  private readonly logger = new Logger(MessageService.name);
  constructor(
    @InjectRepository(Message)
    private messageRepository: Repository<Message>,
    @Inject(forwardRef(() => ConversationService))
    private conversationService: ConversationService,
    @Inject(forwardRef(() => MessagingGateway))
    private messagingGateway: MessagingGateway,
  ) {}

  async findOne(
    tenantId: string,
    conversationId: string,
    messageId: string,
    userId: string
  ): Promise<Message> {
    const message = await this.messageRepository.findOne({
      where: { 
        id: messageId, 
        conversationId,
        tenantId
      },
      relations: ['conversation']
    });

    if (!message) {
      throw new NotFoundException(`Message with ID ${messageId} not found`);
    }

    // Verify user has access to this message
    const isParticipant = await this.conversationService.isParticipant(
      conversationId, 
      userId, 
      tenantId
    );

    if (!isParticipant) {
      throw new BadRequestException('You do not have permission to view this message');
    }

    return message;
  }

  async findAll(
    tenantId: string,
    conversationId: string,
    userId: string,
    query: MessageQueryDto
  ) {
    const { limit = 50, before, after } = query;
    
    // Verify user has access to this conversation
    const isParticipant = await this.conversationService.isParticipant(
      conversationId, 
      userId, 
      tenantId
    );

    if (!isParticipant) {
      throw new BadRequestException('You do not have permission to view these messages');
    }

    const queryBuilder = this.messageRepository
      .createQueryBuilder('message')
      .where('message.conversationId = :conversationId', { conversationId })
      .andWhere('message.tenantId = :tenantId', { tenantId })
      .orderBy('message.createdAt', 'DESC')
      .take(limit);

    if (before) {
      queryBuilder.andWhere('message.createdAt < :before', { before: new Date(before) });
    }

    if (after) {
      queryBuilder.andWhere('message.createdAt > :after', { after: new Date(after) });
    }

    const [messages, total] = await queryBuilder.getManyAndCount();
    return { data: messages, total };
  }

  async create(
    createMessageDto: CreateMessageDto & { conversationId: string },
    userId: string,
    tenantId: string,
  ): Promise<Message> {
    const { conversationId, content, type = MessageType.TEXT, metadata = {} } = createMessageDto;

    // Verify the conversation exists and user is a participant
    const conversation = await this.conversationService.findOne(conversationId, tenantId);
    if (!conversation) {
      throw new NotFoundException('Conversation not found');
    }

    // Verify user is a participant in the conversation
    const isParticipant = await this.conversationService.isParticipant(conversationId, userId, tenantId);
    if (!isParticipant) {
      throw new BadRequestException('You are not a participant in this conversation');
    }

    // Create and save the message
    const message = this.messageRepository.create({
      ...createMessageDto,
      senderId: userId,
      tenantId,
      readBy: [{ userId, readAt: new Date() }],
    });

    const savedMessage = await this.messageRepository.save(message);

    // Update conversation's lastMessage and lastMessageAt
    await this.conversationService.updateLastMessage(conversationId, savedMessage.id);

    // Notify participants about the new message
    await this.messagingGateway.notifyNewMessage(
      conversationId,
      savedMessage,
      userId
    );

    return savedMessage;
  }

  async update(
    id: string,
    updateMessageDto: UpdateMessageDto,
    userId: string,
    tenantId: string,
  ): Promise<Message> {
    const message = await this.messageRepository.findOne({ where: { id, tenantId } });
    
    if (!message) {
      throw new NotFoundException('Message not found');
    }

    // Only the sender can update the message
    if (message.senderId !== userId) {
      throw new BadRequestException('You can only update your own messages');
    }

    // Prevent updating certain fields
    const { content, metadata } = updateMessageDto;
    
    if (content) message.content = content;
    if (metadata) message.metadata = { ...message.metadata, ...metadata };
    
    message.updatedAt = new Date();
    
    const updatedMessage = await this.messageRepository.save(message);
    
    // Notify participants about the message update
    await this.messagingGateway.notifyMessageUpdated(
      message.conversationId,
      updatedMessage
    );

    return updatedMessage;
  }

  async addReaction(
    tenantId: string,
    conversationId: string,
    messageId: string,
    emoji: string,
    userId: string
  ): Promise<Message> {
    const message = await this.findOne(tenantId, conversationId, messageId, userId);
    
    const reactions = message.reactions || [];
    const reactionIndex = reactions.findIndex(r => r.emoji === emoji);

    if (reactionIndex === -1) {
      // Add new reaction
      reactions.push({
        emoji,
        userIds: [userId],
      });
    } else if (!reactions[reactionIndex].userIds.includes(userId)) {
      // Add user to existing reaction
      reactions[reactionIndex].userIds.push(userId);
    } else {
      // Remove user's reaction if already exists
      reactions[reactionIndex].userIds = reactions[reactionIndex].userIds.filter(id => id !== userId);
      
      // Remove reaction if no users left
      if (reactions[reactionIndex].userIds.length === 0) {
        reactions.splice(reactionIndex, 1);
      }
    }

    message.reactions = reactions;
    return this.messageRepository.save(message);
  }

  async markAsRead(
    tenantId: string,
    conversationId: string,
    messageId: string,
    userId: string
  ): Promise<Message> {
    const message = await this.findOne(tenantId, conversationId, messageId, userId);
    
    // Mark the message as read by this user
    const readEntry = {
      userId,
      readAt: new Date()
    };
    
    if (!message.readBy) {
      message.readBy = [readEntry];
    } else {
      const existingReadIndex = message.readBy.findIndex(entry => entry.userId === userId);
      if (existingReadIndex === -1) {
        message.readBy.push(readEntry);
      } else {
        message.readBy[existingReadIndex] = readEntry;
      }
    }
    
    // Update the message
    message.updatedAt = new Date();
    return this.messageRepository.save(message);
  }

  async markConversationAsRead(conversationId: string, userId: string): Promise<void> {
    // Mark all unread messages in the conversation as read
    await this.messageRepository
      .createQueryBuilder()
      .update(Message)
      .set({ 
        readBy: () => `jsonb_set(
          COALESCE(\"readBy\", '[]'::jsonb) || 
          CASE WHEN NOT (\"readBy\" @> :userRead) THEN :userRead ELSE '[]'::jsonb END,
          '{0}',
          :userRead
        )`
      })
      .where('\"conversationId\" = :conversationId', { conversationId })
      .andWhere('(\"readBy\" IS NULL OR NOT (\"readBy\" @> :userRead))')
      .setParameter('userRead', JSON.stringify([{ userId, readAt: new Date() }]))
      .execute();
  }

  async delete(id: string, userId: string, tenantId: string): Promise<void> {
    const message = await this.messageRepository.findOne({ where: { id, tenantId } });
    
    if (!message) {
      throw new NotFoundException('Message not found');
    }

    // Only the sender can delete the message
    if (message.senderId !== userId) {
      throw new BadRequestException('You can only delete your own messages');
    }

    await this.messageRepository.remove(message);
    
    // Notify participants about the message deletion
    await this.messagingGateway.notifyMessageDeleted(message.conversationId, id);
  }
}
