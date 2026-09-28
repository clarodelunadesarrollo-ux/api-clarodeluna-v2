import { Message } from '../../domain/entities/message.entity';
import { MessageSenderType } from '../../domain/enums/message-sender-type.enum';
import { MessageType } from '../../domain/enums/message-type.enum';

export class MessageResponseDto {
  readonly id: string;
  readonly senderType: MessageSenderType;
  readonly type: MessageType;
  readonly body: string | null;
  readonly imageUrl: string | null;
  readonly readAt: string | null;
  readonly createdAt: string;

  constructor(message: Message) {
    this.id = message.id;
    this.senderType = message.senderType;
    this.type = message.type;
    this.body = message.body;
    this.imageUrl = message.imageUrl;
    this.readAt = message.readAt ? message.readAt.toISOString() : null;
    this.createdAt = message.createdAt.toISOString();
  }
}

export class MessagesResponseDto {
  readonly messages: MessageResponseDto[];

  constructor(messages: Message[]) {
    this.messages = messages.map((message) => new MessageResponseDto(message));
  }
}
