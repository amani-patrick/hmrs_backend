import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { Conversation } from './entities/conversation.entity';
import { Message } from './entities/message.entity';
import { ConversationController } from './conversation.controller';
import { MessageController } from './message.controller';
import { ConversationService } from './conversation.service';
import { MessageService } from './message.service';
import { AuthModule } from '../../auth/auth.module';
import { MessagingGateway } from './gateways/messaging.gateway';

@Module({
  imports: [
    TypeOrmModule.forFeature([Conversation, Message]),
    JwtModule.register({}),
    forwardRef(() => AuthModule),
  ],
  controllers: [ConversationController, MessageController],
  providers: [
    ConversationService, 
    MessageService, 
    MessagingGateway,
  ],
  exports: [ConversationService, MessageService],
})
export class MessagingModule {}
