import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Conversation } from './entities/conversation.entity';
import { Message } from './entities/message.entity';
import { ConversationController } from './conversation.controller';
import { MessageController } from './message.controller';
import { ConversationService } from './conversation.service';
import { MessageService } from './message.service';
import { AuthModule } from '../../auth/auth.module';
import { MessagingGateway } from './gateways/messaging.gateway';
import { JwtService } from '@nestjs/jwt';

@Module({
  imports: [
    TypeOrmModule.forFeature([Conversation, Message]),
    forwardRef(() => AuthModule),
  ],
  controllers: [ConversationController, MessageController],
  providers: [
    ConversationService, 
    MessageService, 
    MessagingGateway,
    JwtService,
  ],
  exports: [ConversationService, MessageService],
})
export class MessagingModule {}
