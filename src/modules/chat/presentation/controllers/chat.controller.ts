import {
    Body,
    Controller,
    Get,
    HttpCode,
    HttpStatus,
    Inject,
    Post,
    Query,
    UploadedFile,
    UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';

import {
    AuthenticatedUser,
    CurrentUser,
} from '../../../../common/auth/current-user.decorator';
import {
    GET_CLIENT_READ_STATE_USE_CASE,
    GetClientReadStateUseCasePort,
} from '../../application/ports/in/get-client-read-state.port';
import {
    GET_CLIENT_UNREAD_COUNT_USE_CASE,
    GetClientUnreadCountUseCasePort,
} from '../../application/ports/in/get-client-unread-count.port';
import {
    GET_OR_CREATE_CONVERSATION_USE_CASE,
    GetOrCreateConversationUseCasePort,
} from '../../application/ports/in/get-or-create-conversation.port';
import {
    LIST_CLIENT_MESSAGES_USE_CASE,
    ListClientMessagesUseCasePort,
} from '../../application/ports/in/list-client-messages.port';
import {
    MARK_CLIENT_READ_USE_CASE,
    MarkClientReadUseCasePort,
} from '../../application/ports/in/mark-client-read.port';
import {
    SEND_CLIENT_IMAGE_MESSAGE_USE_CASE,
    SendClientImageMessageUseCasePort,
} from '../../application/ports/in/send-client-image-message.port';
import {
    SEND_CLIENT_MESSAGE_USE_CASE,
    SendClientMessageUseCasePort,
} from '../../application/ports/in/send-client-message.port';
import { InvalidMessageException } from '../../domain/exceptions/invalid-message.exception';
import { ConversationResponseDto } from '../dtos/conversation-response.dto';
import {
    MessageResponseDto,
    MessagesResponseDto,
} from '../dtos/message-response.dto';
import { ReadStateResponseDto } from '../dtos/read-state-response.dto';
import { SendMessageDto } from '../dtos/send-message.dto';
import { parseMessagesLimit } from '../pagination.util';

// Client-facing chat surface. Protected by the global JwtAuthGuard; the caller
// is always the owner of its own conversation (resolved from the JWT userId).
@Controller('chat')
export class ChatController {
  constructor(
    @Inject(GET_OR_CREATE_CONVERSATION_USE_CASE)
    private readonly getOrCreateConversation: GetOrCreateConversationUseCasePort,
    @Inject(LIST_CLIENT_MESSAGES_USE_CASE)
    private readonly listMessages: ListClientMessagesUseCasePort,
    @Inject(SEND_CLIENT_MESSAGE_USE_CASE)
    private readonly sendMessage: SendClientMessageUseCasePort,
    @Inject(SEND_CLIENT_IMAGE_MESSAGE_USE_CASE)
    private readonly sendImage: SendClientImageMessageUseCasePort,
    @Inject(MARK_CLIENT_READ_USE_CASE)
    private readonly markRead: MarkClientReadUseCasePort,
    @Inject(GET_CLIENT_UNREAD_COUNT_USE_CASE)
    private readonly unreadCount: GetClientUnreadCountUseCasePort,
    @Inject(GET_CLIENT_READ_STATE_USE_CASE)
    private readonly readState: GetClientReadStateUseCasePort,
  ) {}

  @Get('conversation')
  async getConversation(
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<ConversationResponseDto> {
    const { conversation, unreadCount } =
      await this.getOrCreateConversation.execute(user.userId);
    return new ConversationResponseDto(conversation, unreadCount);
  }

  @Get('conversation/messages')
  async getMessages(
    @CurrentUser() user: AuthenticatedUser,
    @Query('afterId') afterId?: string,
    @Query('limit') limit?: string,
  ): Promise<MessagesResponseDto> {
    const messages = await this.listMessages.execute(
      user.userId,
      afterId ?? null,
      parseMessagesLimit(limit),
    );
    return new MessagesResponseDto(messages);
  }

  @Post('conversation/messages')
  @HttpCode(HttpStatus.CREATED)
  async postMessage(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: SendMessageDto,
  ): Promise<MessageResponseDto> {
    const message = await this.sendMessage.execute(user.userId, dto.body);
    return new MessageResponseDto(message);
  }

  @Post('conversation/messages/image')
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(FileInterceptor('image'))
  async postImage(
    @CurrentUser() user: AuthenticatedUser,
    @UploadedFile() file?: Express.Multer.File,
  ): Promise<MessageResponseDto> {
    if (!file) {
      throw new InvalidMessageException(
        'image file is required',
        'Adjuntá una imagen.',
      );
    }
    const message = await this.sendImage.execute(
      user.userId,
      file.buffer,
      file.mimetype,
    );
    return new MessageResponseDto(message);
  }

  @Post('conversation/read')
  @HttpCode(HttpStatus.OK)
  async read(
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<{ unreadCount: number }> {
    await this.markRead.execute(user.userId);
    return { unreadCount: 0 };
  }

  @Get('unread-count')
  async getUnreadCount(
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<{ count: number }> {
    const count = await this.unreadCount.execute(user.userId);
    return { count };
  }

  @Get('conversation/read-state')
  async getReadState(
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<ReadStateResponseDto> {
    const state = await this.readState.execute(user.userId);
    return new ReadStateResponseDto(state);
  }
}
