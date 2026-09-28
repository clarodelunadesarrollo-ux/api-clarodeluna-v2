import { Injectable } from '@nestjs/common';

import { PrismaService } from '../../../../../prisma/prisma.service';
import {
    CreateImageMessageData,
    CreateTextMessageData,
    MessageRepositoryPort,
} from '../../../application/ports/out/message-repository.port';
import { Message } from '../../../domain/entities/message.entity';
import { MessageSenderType } from '../../../domain/enums/message-sender-type.enum';
import { MessageType } from '../../../domain/enums/message-type.enum';
import { MessageMapper } from '../mappers/message.mapper';

@Injectable()
export class MessagePrismaRepository implements MessageRepositoryPort {
  constructor(private readonly prisma: PrismaService) {}

  async findByConversation(
    conversationId: string,
    afterId: string | null,
    limit: number,
  ): Promise<Message[]> {
    // Resolve the cursor to a (createdAt, id) pair so ties on createdAt never
    // drop or duplicate messages during incremental polling.
    let cursor: { createdAt: Date; id: string } | null = null;
    if (afterId) {
      cursor = await this.prisma.message.findUnique({
        where: { id: afterId },
        select: { createdAt: true, id: true },
      });
    }

    const rows = await this.prisma.message.findMany({
      where: {
        conversationId,
        ...(cursor
          ? {
              OR: [
                { createdAt: { gt: cursor.createdAt } },
                { createdAt: cursor.createdAt, id: { gt: cursor.id } },
              ],
            }
          : {}),
      },
      orderBy: [{ createdAt: 'asc' }, { id: 'asc' }],
      take: limit,
    });
    return rows.map((row) => MessageMapper.toDomain(row));
  }

  async createText(data: CreateTextMessageData): Promise<Message> {
    const row = await this.prisma.$transaction(async (tx) => {
      const message = await tx.message.create({
        data: {
          conversationId: data.conversationId,
          senderType: data.senderType,
          senderId: data.senderId,
          type: MessageType.TEXT,
          body: data.body,
        },
      });
      await tx.conversation.update({
        where: { id: data.conversationId },
        data: { lastMessageAt: message.createdAt },
      });
      return message;
    });
    return MessageMapper.toDomain(row);
  }

  async createImage(data: CreateImageMessageData): Promise<Message> {
    const row = await this.prisma.$transaction(async (tx) => {
      const message = await tx.message.create({
        data: {
          conversationId: data.conversationId,
          senderType: data.senderType,
          senderId: data.senderId,
          type: MessageType.IMAGE,
          imageUrl: data.imageUrl,
        },
      });
      await tx.conversation.update({
        where: { id: data.conversationId },
        data: { lastMessageAt: message.createdAt },
      });
      return message;
    });
    return MessageMapper.toDomain(row);
  }

  async countUnread(
    conversationId: string,
    senderType: MessageSenderType,
  ): Promise<number> {
    return this.prisma.message.count({
      where: { conversationId, senderType, readAt: null },
    });
  }

  async markRead(
    conversationId: string,
    senderType: MessageSenderType,
  ): Promise<void> {
    await this.prisma.message.updateMany({
      where: { conversationId, senderType, readAt: null },
      data: { readAt: new Date() },
    });
  }

  async lastReadAtForSender(
    conversationId: string,
    senderType: MessageSenderType,
  ): Promise<Date | null> {
    const result = await this.prisma.message.aggregate({
      _max: { readAt: true },
      where: { conversationId, senderType, readAt: { not: null } },
    });
    return result._max.readAt;
  }
}
