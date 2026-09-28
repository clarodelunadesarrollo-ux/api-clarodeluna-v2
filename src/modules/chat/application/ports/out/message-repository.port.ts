import { Message } from '../../../domain/entities/message.entity';
import { MessageSenderType } from '../../../domain/enums/message-sender-type.enum';

export const MESSAGE_REPOSITORY = Symbol('MESSAGE_REPOSITORY');

export interface CreateTextMessageData {
  conversationId: string;
  senderType: MessageSenderType;
  senderId: string;
  body: string;
}

export interface CreateImageMessageData {
  conversationId: string;
  senderType: MessageSenderType;
  senderId: string;
  imageUrl: string;
}

export interface MessageRepositoryPort {
  // Messages of a conversation ascending by createdAt. When `afterId` is set,
  // only messages created after that cursor are returned (incremental polling).
  findByConversation(
    conversationId: string,
    afterId: string | null,
    limit: number,
  ): Promise<Message[]>;

  // Creates a TEXT message and bumps the conversation `lastMessageAt`
  // atomically. Returns the created message.
  createText(data: CreateTextMessageData): Promise<Message>;

  // Creates an IMAGE message (body null, imageUrl set) and bumps the
  // conversation `lastMessageAt` atomically. Returns the created message.
  createImage(data: CreateImageMessageData): Promise<Message>;

  // Counts messages of the given senderType still unread (readAt = null).
  countUnread(
    conversationId: string,
    senderType: MessageSenderType,
  ): Promise<number>;

  // Marks every unread message of the given senderType as read (readAt = now).
  markRead(
    conversationId: string,
    senderType: MessageSenderType,
  ): Promise<void>;

  // Most recent readAt among messages authored by `senderType`. Lets the sender
  // learn when the other side last read its messages (read receipts over
  // polling): any own message with createdAt <= this value is "read".
  lastReadAtForSender(
    conversationId: string,
    senderType: MessageSenderType,
  ): Promise<Date | null>;
}
