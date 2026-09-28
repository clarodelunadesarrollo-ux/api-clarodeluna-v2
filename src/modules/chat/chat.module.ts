import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { RolesGuard } from '../../common/auth/roles.guard';
import { GET_CLIENT_READ_STATE_USE_CASE } from './application/ports/in/get-client-read-state.port';
import { GET_CLIENT_UNREAD_COUNT_USE_CASE } from './application/ports/in/get-client-unread-count.port';
import { GET_CONVERSATION_READ_STATE_USE_CASE } from './application/ports/in/get-conversation-read-state.port';
import { GET_OR_CREATE_CONVERSATION_USE_CASE } from './application/ports/in/get-or-create-conversation.port';
import { LIST_CLIENT_MESSAGES_USE_CASE } from './application/ports/in/list-client-messages.port';
import { LIST_CONVERSATION_MESSAGES_USE_CASE } from './application/ports/in/list-conversation-messages.port';
import { LIST_CONVERSATIONS_USE_CASE } from './application/ports/in/list-conversations.port';
import { MARK_ADMIN_READ_USE_CASE } from './application/ports/in/mark-admin-read.port';
import { MARK_CLIENT_READ_USE_CASE } from './application/ports/in/mark-client-read.port';
import { SEND_ADMIN_IMAGE_MESSAGE_USE_CASE } from './application/ports/in/send-admin-image-message.port';
import { SEND_ADMIN_MESSAGE_USE_CASE } from './application/ports/in/send-admin-message.port';
import { SEND_CLIENT_IMAGE_MESSAGE_USE_CASE } from './application/ports/in/send-client-image-message.port';
import { SEND_CLIENT_MESSAGE_USE_CASE } from './application/ports/in/send-client-message.port';
import {
    CONVERSATION_REPOSITORY,
    ConversationRepositoryPort,
} from './application/ports/out/conversation-repository.port';
import { IMAGE_STORAGE, ImageStoragePort } from './application/ports/out/image-storage.port';
import {
    MESSAGE_REPOSITORY,
    MessageRepositoryPort,
} from './application/ports/out/message-repository.port';
import { GetClientReadStateUseCase } from './application/use-cases/get-client-read-state.use-case';
import { GetClientUnreadCountUseCase } from './application/use-cases/get-client-unread-count.use-case';
import { GetConversationReadStateUseCase } from './application/use-cases/get-conversation-read-state.use-case';
import { GetOrCreateConversationUseCase } from './application/use-cases/get-or-create-conversation.use-case';
import { ListClientMessagesUseCase } from './application/use-cases/list-client-messages.use-case';
import { ListConversationMessagesUseCase } from './application/use-cases/list-conversation-messages.use-case';
import { ListConversationsUseCase } from './application/use-cases/list-conversations.use-case';
import { MarkAdminReadUseCase } from './application/use-cases/mark-admin-read.use-case';
import { MarkClientReadUseCase } from './application/use-cases/mark-client-read.use-case';
import { SendAdminImageMessageUseCase } from './application/use-cases/send-admin-image-message.use-case';
import { SendAdminMessageUseCase } from './application/use-cases/send-admin-message.use-case';
import { SendClientImageMessageUseCase } from './application/use-cases/send-client-image-message.use-case';
import { SendClientMessageUseCase } from './application/use-cases/send-client-message.use-case';
import { ConversationPrismaRepository } from './infrastructure/persistence/repositories/conversation-prisma.repository';
import { MessagePrismaRepository } from './infrastructure/persistence/repositories/message-prisma.repository';
import { CloudinaryImageStorageAdapter } from './infrastructure/storage/cloudinary-image-storage.adapter';
import { ChatAdminController } from './presentation/controllers/chat-admin.controller';
import { ChatController } from './presentation/controllers/chat.controller';

@Module({
  controllers: [ChatController, ChatAdminController],
  providers: [
    RolesGuard,
    { provide: CONVERSATION_REPOSITORY, useClass: ConversationPrismaRepository },
    { provide: MESSAGE_REPOSITORY, useClass: MessagePrismaRepository },
    {
      provide: IMAGE_STORAGE,
      useFactory: (config: ConfigService): CloudinaryImageStorageAdapter =>
        new CloudinaryImageStorageAdapter({
          cloudName: config.get<string>('CLOUDINARY_CLOUD_NAME'),
          apiKey: config.get<string>('CLOUDINARY_API_KEY'),
          apiSecret: config.get<string>('CLOUDINARY_API_SECRET'),
          folder: config.get<string>('CLOUDINARY_CHAT_FOLDER') ?? 'chat',
        }),
      inject: [ConfigService],
    },
    {
      provide: GET_OR_CREATE_CONVERSATION_USE_CASE,
      useFactory: (
        conversations: ConversationRepositoryPort,
        messages: MessageRepositoryPort,
      ): GetOrCreateConversationUseCase =>
        new GetOrCreateConversationUseCase(conversations, messages),
      inject: [CONVERSATION_REPOSITORY, MESSAGE_REPOSITORY],
    },
    {
      provide: LIST_CLIENT_MESSAGES_USE_CASE,
      useFactory: (
        conversations: ConversationRepositoryPort,
        messages: MessageRepositoryPort,
      ): ListClientMessagesUseCase =>
        new ListClientMessagesUseCase(conversations, messages),
      inject: [CONVERSATION_REPOSITORY, MESSAGE_REPOSITORY],
    },
    {
      provide: SEND_CLIENT_MESSAGE_USE_CASE,
      useFactory: (
        conversations: ConversationRepositoryPort,
        messages: MessageRepositoryPort,
      ): SendClientMessageUseCase =>
        new SendClientMessageUseCase(conversations, messages),
      inject: [CONVERSATION_REPOSITORY, MESSAGE_REPOSITORY],
    },
    {
      provide: SEND_CLIENT_IMAGE_MESSAGE_USE_CASE,
      useFactory: (
        conversations: ConversationRepositoryPort,
        messages: MessageRepositoryPort,
        storage: ImageStoragePort,
      ): SendClientImageMessageUseCase =>
        new SendClientImageMessageUseCase(conversations, messages, storage),
      inject: [CONVERSATION_REPOSITORY, MESSAGE_REPOSITORY, IMAGE_STORAGE],
    },
    {
      provide: MARK_CLIENT_READ_USE_CASE,
      useFactory: (
        conversations: ConversationRepositoryPort,
        messages: MessageRepositoryPort,
      ): MarkClientReadUseCase =>
        new MarkClientReadUseCase(conversations, messages),
      inject: [CONVERSATION_REPOSITORY, MESSAGE_REPOSITORY],
    },
    {
      provide: GET_CLIENT_UNREAD_COUNT_USE_CASE,
      useFactory: (
        conversations: ConversationRepositoryPort,
        messages: MessageRepositoryPort,
      ): GetClientUnreadCountUseCase =>
        new GetClientUnreadCountUseCase(conversations, messages),
      inject: [CONVERSATION_REPOSITORY, MESSAGE_REPOSITORY],
    },
    {
      provide: GET_CLIENT_READ_STATE_USE_CASE,
      useFactory: (
        conversations: ConversationRepositoryPort,
        messages: MessageRepositoryPort,
      ): GetClientReadStateUseCase =>
        new GetClientReadStateUseCase(conversations, messages),
      inject: [CONVERSATION_REPOSITORY, MESSAGE_REPOSITORY],
    },
    {
      provide: LIST_CONVERSATIONS_USE_CASE,
      useFactory: (
        conversations: ConversationRepositoryPort,
      ): ListConversationsUseCase =>
        new ListConversationsUseCase(conversations),
      inject: [CONVERSATION_REPOSITORY],
    },
    {
      provide: LIST_CONVERSATION_MESSAGES_USE_CASE,
      useFactory: (
        conversations: ConversationRepositoryPort,
        messages: MessageRepositoryPort,
      ): ListConversationMessagesUseCase =>
        new ListConversationMessagesUseCase(conversations, messages),
      inject: [CONVERSATION_REPOSITORY, MESSAGE_REPOSITORY],
    },
    {
      provide: SEND_ADMIN_MESSAGE_USE_CASE,
      useFactory: (
        conversations: ConversationRepositoryPort,
        messages: MessageRepositoryPort,
      ): SendAdminMessageUseCase =>
        new SendAdminMessageUseCase(conversations, messages),
      inject: [CONVERSATION_REPOSITORY, MESSAGE_REPOSITORY],
    },
    {
      provide: SEND_ADMIN_IMAGE_MESSAGE_USE_CASE,
      useFactory: (
        conversations: ConversationRepositoryPort,
        messages: MessageRepositoryPort,
        storage: ImageStoragePort,
      ): SendAdminImageMessageUseCase =>
        new SendAdminImageMessageUseCase(conversations, messages, storage),
      inject: [CONVERSATION_REPOSITORY, MESSAGE_REPOSITORY, IMAGE_STORAGE],
    },
    {
      provide: MARK_ADMIN_READ_USE_CASE,
      useFactory: (
        conversations: ConversationRepositoryPort,
        messages: MessageRepositoryPort,
      ): MarkAdminReadUseCase =>
        new MarkAdminReadUseCase(conversations, messages),
      inject: [CONVERSATION_REPOSITORY, MESSAGE_REPOSITORY],
    },
    {
      provide: GET_CONVERSATION_READ_STATE_USE_CASE,
      useFactory: (
        messages: MessageRepositoryPort,
      ): GetConversationReadStateUseCase =>
        new GetConversationReadStateUseCase(messages),
      inject: [MESSAGE_REPOSITORY],
    },
  ],
})
export class ChatModule {}
