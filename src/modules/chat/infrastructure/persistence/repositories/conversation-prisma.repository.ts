import { Injectable } from '@nestjs/common';

import { PrismaService } from '../../../../../prisma/prisma.service';
import {
    ConversationRepositoryPort,
    ConversationSummaryView,
} from '../../../application/ports/out/conversation-repository.port';
import { Conversation } from '../../../domain/entities/conversation.entity';
import { MessageSenderType } from '../../../domain/enums/message-sender-type.enum';
import { MessageType } from '../../../domain/enums/message-type.enum';
import { ConversationMapper } from '../mappers/conversation.mapper';

@Injectable()
export class ConversationPrismaRepository implements ConversationRepositoryPort {
  constructor(private readonly prisma: PrismaService) {}

  async findByClientId(clientId: string): Promise<Conversation | null> {
    const row = await this.prisma.conversation.findUnique({
      where: { clientId },
    });
    return row ? ConversationMapper.toDomain(row) : null;
  }

  async findById(id: string): Promise<Conversation | null> {
    const row = await this.prisma.conversation.findUnique({ where: { id } });
    return row ? ConversationMapper.toDomain(row) : null;
  }

  async create(clientId: string): Promise<Conversation> {
    const row = await this.prisma.conversation.create({ data: { clientId } });
    return ConversationMapper.toDomain(row);
  }

  async findSummaries(limit: number): Promise<ConversationSummaryView[]> {
    const conversations = await this.prisma.conversation.findMany({
      orderBy: { lastMessageAt: 'desc' },
      take: limit,
      include: { client: { select: { name: true, email: true } } },
    });
    if (conversations.length === 0) {
      return [];
    }
    const ids = conversations.map((conversation) => conversation.id);

    // Unread CLIENT messages per conversation (what the admin still has to read).
    const unreadGroups = await this.prisma.message.groupBy({
      by: ['conversationId'],
      where: {
        conversationId: { in: ids },
        senderType: MessageSenderType.CLIENT,
        readAt: null,
      },
      _count: { _all: true },
    });
    const unreadByConversation = new Map<string, number>();
    for (const group of unreadGroups) {
      unreadByConversation.set(group.conversationId, group._count._all);
    }

    // Latest message per conversation for the inbox preview (one query, no N+1).
    const lastMessages = await this.prisma.message.findMany({
      where: { conversationId: { in: ids } },
      orderBy: { createdAt: 'desc' },
      distinct: ['conversationId'],
      select: { conversationId: true, body: true, type: true },
    });
    const previewByConversation = new Map<string, string | null>();
    for (const message of lastMessages) {
      previewByConversation.set(
        message.conversationId,
        message.type === MessageType.IMAGE ? 'Imagen' : message.body,
      );
    }

    return conversations.map((conversation) => ({
      id: conversation.id,
      clientId: conversation.clientId,
      clientName: conversation.client.name,
      clientEmail: conversation.client.email,
      lastMessageAt: conversation.lastMessageAt,
      lastMessagePreview: previewByConversation.get(conversation.id) ?? null,
      unreadCount: unreadByConversation.get(conversation.id) ?? 0,
    }));
  }
}
