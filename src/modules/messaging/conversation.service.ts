import { 
  Injectable, 
  NotFoundException, 
  BadRequestException, 
  Inject, 
  forwardRef,
  Logger 
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, FindOptionsWhere } from 'typeorm';
import { Conversation, ConversationType } from './entities/conversation.entity';
import { CreateConversationDto, ParticipantDto } from './dto/create-conversation.dto';
import { UpdateConversationDto } from './dto/update-conversation.dto';
import { ConversationQueryDto } from './dto/conversation-query.dto';
import { MessageService } from './message.service';
import { MessagingGateway } from './gateways/messaging.gateway';

@Injectable()
export class ConversationService {
  constructor(
    @InjectRepository(Conversation)
    private conversationRepository: Repository<Conversation>,
    @Inject(forwardRef(() => MessageService))
    private messageService: MessageService,
    private messagingGateway: MessagingGateway,
  ) {}

  private readonly logger = new Logger(ConversationService.name);

  async findOne(id: string, tenantId: string): Promise<Conversation> {
    const conversation = await this.conversationRepository.findOne({ 
      where: { id, tenantId } as FindOptionsWhere<Conversation> 
    });
    
    if (!conversation) {
      throw new NotFoundException(`Conversation with ID ${id} not found`);
    }
    
    return conversation;
  }

  async isParticipant(conversationId: string, userId: string, tenantId: string): Promise<boolean> {
    const conversation = await this.conversationRepository.findOne({
      where: { 
        id: conversationId, 
        tenantId,
        participantIds: In([userId])
      } as FindOptionsWhere<Conversation>
    });
    
    return !!conversation;
  }

  async updateLastMessage(conversationId: string, messageId: string, lastMessageAt?: Date): Promise<void> {
    try {
      await this.conversationRepository.update(conversationId, {
        lastMessageAt: lastMessageAt || new Date(),
        updatedAt: new Date()
      } as Partial<Conversation>);
      
      this.logger.debug(`Updated last message for conversation ${conversationId}`);
    } catch (error) {
      this.logger.error(`Error updating last message for conversation ${conversationId}:`, error);
      throw new Error('Failed to update conversation last message');
    }
  }
  async findAll(
    tenantId: string,
    userId: string,
    query: ConversationQueryDto
  ): Promise<{ data: Conversation[]; total: number }> {
    try {
      const { search, type, isArchived, limit = 20, page = 1 } = query;
      const skip = (page - 1) * limit;
      
      const queryBuilder = this.conversationRepository
        .createQueryBuilder('conversation')
        .where('conversation.tenantId = :tenantId', { tenantId })
        .andWhere(':userId = ANY(conversation.participantIds)', { userId })
        .orderBy('conversation.lastMessageAt', 'DESC')
        .addOrderBy('conversation.updatedAt', 'DESC')
        .take(limit)
        .skip(skip);

      if (search) {
        queryBuilder.andWhere('conversation.name ILIKE :search', { search: `%${search}%` });
      }

      if (type) {
        queryBuilder.andWhere('conversation.type = :type', { type });
      }

      if (isArchived !== undefined) {
        queryBuilder.andWhere('conversation.isArchived = :isArchived', { isArchived });
      }

      const [data, total] = await queryBuilder.getManyAndCount();
      return { data, total };
    } catch (error) {
      this.logger.error('Error finding conversations:', error);
      throw new Error('Failed to retrieve conversations');
    }
  }

  async findDirectConversation(user1Id: string, user2Id: string | ParticipantDto, tenantId: string): Promise<Conversation | null> {
    try {
      // Extract userId if user2Id is a ParticipantDto
      const participantId = typeof user2Id === 'string' ? user2Id : user2Id.userId;
      
      if (!user1Id || !participantId) {
        return null;
      }
      
      const conversations = await this.conversationRepository
        .createQueryBuilder('conversation')
        .where('conversation.tenantId = :tenantId', { tenantId })
        .andWhere('conversation.type = :type', { type: 'direct' })
        .andWhere('conversation.participantIds @> ARRAY[:...userIds]')
        .andWhere('array_length(conversation.participantIds, 1) = 2')
        .setParameter('userIds', [user1Id, participantId])
        .getMany();

      return conversations.length > 0 ? conversations[0] : null;
    } catch (error) {
      this.logger.error(`Error finding direct conversation between ${user1Id} and ${user2Id}:`, error);
      throw new Error('Failed to find direct conversation');
    }
  }

  async getConversationParticipants(conversationId: string): Promise<Array<{ userId: string }>> {
    const conversation = await this.conversationRepository.findOne({
      where: { id: conversationId },
      select: ['participantIds']
    });

    if (!conversation) {
      throw new NotFoundException(`Conversation with ID ${conversationId} not found`);
    }

    return conversation.participantIds.map(userId => ({ userId }));
  }

  async create(
    tenantId: string,
    createConversationDto: CreateConversationDto,
    userId: string
  ): Promise<Conversation> {
    const { participants = [], type = ConversationType.DIRECT, metadata = {} } = createConversationDto;
    const participantIds = participants.map(p => p.userId);
    
    if (type === 'direct' && participants.length === 1) {
      const existingConversation = await this.findDirectConversation(userId, participants[0], tenantId);
      if (existingConversation) {
        return existingConversation;
      }
    }

    //create a new conversation 
    const conversation = new Conversation();
    Object.assign(conversation, {
      ...createConversationDto,
      createdById: userId,
      tenantId,
      participantIds: [...new Set([userId, ...participantIds])],
      type: type as ConversationType,
      metadata,
      lastMessageAt: new Date(),
      isArchived: false,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    const savedConversation = await this.conversationRepository.save(conversation);

    // Notify participants about the new conversation
    if (savedConversation?.id) {
      await this.messagingGateway.emitToConversation(
        savedConversation.id,
        'conversationCreated',
        { conversation: savedConversation },
        userId
      );
    }

    return savedConversation;
  }

  async update(
    id: string,
    updateConversationDto: UpdateConversationDto,
    userId: string,
    tenantId: string
  ): Promise<Conversation> {
    const conversation = await this.conversationRepository.findOne({ where: { id, tenantId } });
    
    if (!conversation) {
      throw new NotFoundException('Conversation not found');
    }

    // Only the creator or an admin can update the conversation
    if (conversation.createdById !== userId) {
      throw new BadRequestException('You do not have permission to update this conversation');
    }

    const addedParticipants: string[] = [];
    const removedParticipants: string[] = [];

    // Handle adding/removing participants if specified
    if (updateConversationDto.addParticipants || updateConversationDto.removeParticipants) {
      const addParticipants = updateConversationDto.addParticipants || [];
      const removeParticipants = updateConversationDto.removeParticipants || [];
      
      // Add new participants (avoiding duplicates)
      if (addParticipants.length > 0) {
        const newParticipants = new Set([...conversation.participantIds, ...addParticipants]);
        addedParticipants.push(...addParticipants.filter(p => !conversation.participantIds.includes(p)));
        conversation.participantIds = Array.from(newParticipants);
      }
      
      // Remove participants
      if (removeParticipants.length > 0) {
        removedParticipants.push(...removeParticipants.filter(p => conversation.participantIds.includes(p)));
        conversation.participantIds = conversation.participantIds.filter(
          participantId => !removeParticipants.includes(participantId)
        );
      }
    }

    // Update other fields
    if (updateConversationDto.name !== undefined) {
      conversation.name = updateConversationDto.name ?? null;
    }
    
    if (updateConversationDto.metadata) {
      conversation.metadata = { 
        ...(conversation.metadata || {}), 
        ...updateConversationDto.metadata 
      };
    }
    
    if (updateConversationDto.isArchived !== undefined) {
      conversation.isArchived = Boolean(updateConversationDto.isArchived);
    }

    const updatedConversation = await this.conversationRepository.save(conversation);
    
    // Notify participants about the update if there are changes
    if (addedParticipants.length > 0 || removedParticipants.length > 0 || 
        'name' in updateConversationDto || 
        updateConversationDto.metadata) {
      
      await this.messagingGateway.emitToConversation(
        id,
        'conversationUpdated',
        {
          ...updatedConversation,
          addedParticipants,
          removedParticipants,
          updatedBy: userId
        },
        userId
      );
    }

    return updatedConversation;
  }

  async markAsRead(conversationId: string, userId: string, tenantId: string): Promise<void> {
    try {
      const conversation = await this.conversationRepository.findOne({
        where: { id: conversationId, tenantId }
      });

      if (!conversation) {
        throw new NotFoundException('Conversation not found');
      }

      // Check if user is a participant
      if (!conversation.participantIds.includes(userId)) {
        throw new BadRequestException('You are not a participant in this conversation');
      }

      // In a real implementation, you would update the read status of messages here
      // For now, we'll just update the conversation's updatedAt
      await this.conversationRepository.update(
        { id: conversationId },
        { updatedAt: new Date() }
      );

    } catch (error) {
      this.logger.error(`Error marking conversation ${conversationId} as read:`, error);
      throw error;
    }
  }

  async remove(id: string, userId: string, tenantId: string): Promise<void> {
    try {
      const conversation = await this.conversationRepository.findOne({
        where: { id, tenantId }
      });

      if (!conversation) {
        throw new NotFoundException('Conversation not found');
      }

      // Only the creator or an admin can delete the conversation
      if (conversation.createdById !== userId) {
        throw new BadRequestException('You do not have permission to delete this conversation');
      }

      // Soft delete the conversation
      await this.conversationRepository.softDelete(id);

      // Notify participants about the deletion
      await this.messagingGateway.emitToConversation(
        id,
        'conversationDeleted',
        { conversationId: id },
        userId
      );
    } catch (error) {
      this.logger.error(`Error deleting conversation ${id}:`, error);
      throw error;
    }
  }
}
