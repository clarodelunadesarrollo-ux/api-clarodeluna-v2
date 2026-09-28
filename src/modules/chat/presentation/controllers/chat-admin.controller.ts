import {
    Body,
    Controller,
    Get,
    HttpCode,
    HttpStatus,
    Inject,
    Param,
    ParseUUIDPipe,
    Post,
    Query,
    UploadedFile,
    UseGuards,
    UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';

import {
    AuthenticatedUser,
    CurrentUser,
} from '../../../../common/auth/current-user.decorator';
import { RolesGuard } from '../../../../common/auth/roles.guard';
import { UserRole } from '../../../../common/auth/user-role.enum';
import { Roles } from '../../../../common/decorators/roles.decorator';
import {
    GET_CONVERSATION_READ_STATE_USE_CASE,
    GetConversationReadStateUseCasePort,
} from '../../application/ports/in/get-conversation-read-state.port';
import {
    LIST_CONVERSATION_MESSAGES_USE_CASE,
    ListConversationMessagesUseCasePort,
} from '../../application/ports/in/list-conversation-messages.port';
import {
    LIST_CONVERSATIONS_USE_CASE,
    ListConversationsUseCasePort,
} from '../../application/ports/in/list-conversations.port';
import {
    MARK_ADMIN_READ_USE_CASE,
    MarkAdminReadUseCasePort,
} from '../../application/ports/in/mark-admin-read.port';
import {
    SEND_ADMIN_IMAGE_MESSAGE_USE_CASE,
    SendAdminImageMessageUseCasePort,
} from '../../application/ports/in/send-admin-image-message.port';
import {
    SEND_ADMIN_MESSAGE_USE_CASE,
    SendAdminMessageUseCasePort,
} from '../../application/ports/in/send-admin-message.port';
import { InvalidMessageException } from '../../domain/exceptions/invalid-message.exception';
import { ConversationSummaryListResponseDto } from '../dtos/conversation-summary.dto';
import {
    MessageResponseDto,
    MessagesResponseDto,
} from '../dtos/message-response.dto';
import { ReadStateResponseDto } from '../dtos/read-state-response.dto';
import { SendMessageDto } from '../dtos/send-message.dto';
import { parseMessagesLimit } from '../pagination.util';

// Admin inbox surface for the future admin app. Protected by the global
// JwtAuthGuard AND role-restricted to ADMIN via RolesGuard + @Roles.
@Controller('chat/admin')
@UseGuards(RolesGuard)
@Roles(UserRole.ADMIN)
export class ChatAdminController {
  constructor(
    @Inject(LIST_CONVERSATIONS_USE_CASE)
    private readonly listConversations: ListConversationsUseCasePort,
    @Inject(LIST_CONVERSATION_MESSAGES_USE_CASE)
    private readonly listMessages: ListConversationMessagesUseCasePort,
    @Inject(SEND_ADMIN_MESSAGE_USE_CASE)
    private readonly sendMessage: SendAdminMessageUseCasePort,
    @Inject(SEND_ADMIN_IMAGE_MESSAGE_USE_CASE)
    private readonly sendImage: SendAdminImageMessageUseCasePort,
    @Inject(MARK_ADMIN_READ_USE_CASE)
    private readonly markRead: MarkAdminReadUseCasePort,
    @Inject(GET_CONVERSATION_READ_STATE_USE_CASE)
    private readonly readState: GetConversationReadStateUseCasePort,
  ) {}

  @Get('conversations')
  async getConversations(
    @Query('limit') limit?: string,
  ): Promise<ConversationSummaryListResponseDto> {
    const views = await this.listConversations.execute(
      parseMessagesLimit(limit),
    );
    return new ConversationSummaryListResponseDto(views);
  }

  @Get('conversations/:id/messages')
  async getMessages(
    @Param('id', ParseUUIDPipe) id: string,
    @Query('afterId') afterId?: string,
    @Query('limit') limit?: string,
  ): Promise<MessagesResponseDto> {
    const messages = await this.listMessages.execute(
      id,
      afterId ?? null,
      parseMessagesLimit(limit),
    );
    return new MessagesResponseDto(messages);
  }

  @Get('conversations/:id/read-state')
  async getReadState(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ReadStateResponseDto> {
    const state = await this.readState.execute(id);
    return new ReadStateResponseDto(state);
  }

  @Post('conversations/:id/messages')
  @HttpCode(HttpStatus.CREATED)
  async postMessage(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: SendMessageDto,
  ): Promise<MessageResponseDto> {
    const message = await this.sendMessage.execute(id, user.userId, dto.body);
    return new MessageResponseDto(message);
  }

  @Post('conversations/:id/messages/image')
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(FileInterceptor('image'))
  async postImage(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseUUIDPipe) id: string,
    @UploadedFile() file?: Express.Multer.File,
  ): Promise<MessageResponseDto> {
    if (!file) {
      throw new InvalidMessageException(
        'image file is required',
        'Adjuntá una imagen.',
      );
    }
    const message = await this.sendImage.execute(
      id,
      user.userId,
      file.buffer,
      file.mimetype,
    );
    return new MessageResponseDto(message);
  }

  @Post('conversations/:id/read')
  @HttpCode(HttpStatus.OK)
  async read(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<{ unreadCount: number }> {
    await this.markRead.execute(id);
    return { unreadCount: 0 };
  }
}
