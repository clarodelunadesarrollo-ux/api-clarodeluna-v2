import { Conversation as PrismaConversation } from '@prisma/client';

import { Conversation } from '../../../domain/entities/conversation.entity';

export class ConversationMapper {
  static toDomain(row: PrismaConversation): Conversation {
    return Conversation.rehydrate({
      id: row.id,
      clientId: row.clientId,
      lastMessageAt: row.lastMessageAt,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    });
  }
}
