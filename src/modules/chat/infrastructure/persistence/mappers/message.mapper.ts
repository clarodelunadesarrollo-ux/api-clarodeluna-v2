import { Message as PrismaMessage } from '@prisma/client';

import { Message } from '../../../domain/entities/message.entity';
import { MessageSenderType } from '../../../domain/enums/message-sender-type.enum';
import { MessageType } from '../../../domain/enums/message-type.enum';

export class MessageMapper {
  static toDomain(row: PrismaMessage): Message {
    return Message.rehydrate({
      id: row.id,
      conversationId: row.conversationId,
      senderType: row.senderType as unknown as MessageSenderType,
      senderId: row.senderId,
      type: row.type as unknown as MessageType,
      body: row.body,
      imageUrl: row.imageUrl,
      readAt: row.readAt,
      createdAt: row.createdAt,
    });
  }
}
