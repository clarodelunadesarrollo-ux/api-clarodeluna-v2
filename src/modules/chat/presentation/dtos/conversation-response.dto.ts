import { Conversation } from '../../domain/entities/conversation.entity';

export class ConversationResponseDto {
  readonly id: string;
  readonly lastMessageAt: string | null;
  readonly unreadCount: number;

  constructor(conversation: Conversation, unreadCount: number) {
    this.id = conversation.id;
    this.lastMessageAt = conversation.lastMessageAt
      ? conversation.lastMessageAt.toISOString()
      : null;
    this.unreadCount = unreadCount;
  }
}
