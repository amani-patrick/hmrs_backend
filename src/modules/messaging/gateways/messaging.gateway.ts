import { 
  WebSocketGateway, 
  WebSocketServer, 
  SubscribeMessage, 
  MessageBody, 
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Injectable, UseGuards, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { WsJwtAuthGuard } from '../../../auth/guards/ws-jwt-auth.guard';
import { MessageService } from '../message.service';
import { ConversationService } from '../conversation.service';
import { Message } from '../entities/message.entity';

@Injectable()
@WebSocketGateway({
  namespace: 'messaging',
  cors: {
    origin: process.env.FRONTEND_URL?.split(',') || '*',
    methods: ['GET', 'POST'],
    credentials: true,
  },
})
export class MessagingGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  private readonly logger = new Logger(MessagingGateway.name);
  @WebSocketServer() server: Server;
  private connectedUsers = new Map<string, string>(); 

  constructor(
    private readonly messageService: MessageService,
    private readonly conversationService: ConversationService,
    private readonly jwtService: JwtService,
  ) {}

  afterInit(server: Server) {
    this.logger.log('WebSocket Gateway initialized');
  }

  async handleConnection(client: Socket) {
    try {
      const token = client.handshake.auth?.token || 
                  client.handshake.headers.authorization?.split(' ')[1];
      
      if (!token) {
        this.logger.warn('No token provided');
        client.disconnect();
        return;
      }

      const payload = this.jwtService.verify(token, {
        secret: process.env.JWT_SECRET,
      });
      
      if (!payload?.sub) {
        this.logger.warn('Invalid token payload');
        client.disconnect();
        return;
      }

      const userId = payload.sub;
      this.connectedUsers.set(userId, client.id);
      client.data.userId = userId;
      client.data.tenantId = payload.tenantId;

      // Join user to their own room for direct messages
      client.join(`user_${userId}`);
      
      this.logger.log(`Client connected: ${client.id}, User ID: ${userId}`);
    } catch (error) {
      this.logger.error('WebSocket connection error:', error);
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    if (client.data.userId) {
      this.connectedUsers.delete(client.data.userId);
      this.logger.log(`Client disconnected: ${client.id}, User ID: ${client.data.userId}`);
    }
  }

  @UseGuards(WsJwtAuthGuard)
  @SubscribeMessage('joinConversation')
  async handleJoinConversation(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { conversationId: string },
  ) {
    const { conversationId } = data;
    const { userId, tenantId } = client.data;
    
    try {
      // Verify user is a participant in the conversation
      const isParticipant = await this.conversationService.isParticipant(
        conversationId,
        userId,
        tenantId
      );
      
      if (isParticipant) {
        client.join(`conversation_${conversationId}`);
        return { status: 'success', conversationId };
      } else {
        return { status: 'error', message: 'Not a participant in this conversation' };
      }
    } catch (error) {
      console.error('Error joining conversation:', error);
      return { status: 'error', message: 'Failed to join conversation' };
    }
  }

  @UseGuards(WsJwtAuthGuard)
  @SubscribeMessage('leaveConversation')
  async handleLeaveConversation(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { conversationId: string },
  ) {
    client.leave(`conversation_${data.conversationId}`);
    return { status: 'success', conversationId: data.conversationId };
  }

  // Helper method to emit events to specific users
  emitToUser(userId: string, event: string, data: any) {
    const socketId = this.connectedUsers.get(userId);
    if (socketId) {
      this.server.to(socketId).emit(event, data);
    }
  }

  // Helper method to emit events to all participants in a conversation
  async emitToConversation(conversationId: string, event: string, data: any, excludeUserId?: string) {
    const participants = await this.conversationService.getConversationParticipants(conversationId);
    
    participants.forEach(participant => {
      if (participant.userId !== excludeUserId) {
        this.emitToUser(participant.userId, event, {
          ...data,
          conversationId,
        });
      }
    });
  }

  // Method to notify about new message
  async notifyNewMessage(conversationId: string, message: any, senderId: string) {
    await this.emitToConversation(
      conversationId,
      'newMessage',
      { message },
      senderId
    );
  }

  // Method to notify about message updates
  async notifyMessageUpdated(conversationId: string, message: any) {
    this.server.to(`conversation_${conversationId}`).emit('messageUpdated', { message });
  }

  // Method to notify about message deletion
  async notifyMessageDeleted(conversationId: string, messageId: string) {
    this.server.to(`conversation_${conversationId}`).emit('messageDeleted', { messageId });
  }

  // Method to notify about conversation updates
  async notifyConversationUpdated(conversationId: string, update: any) {
    this.server.to(`conversation_${conversationId}`).emit('conversationUpdated', { conversationId, ...update });
  }
}
