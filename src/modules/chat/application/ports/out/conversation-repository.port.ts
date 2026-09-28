import { Conversation } from '../../../domain/entities/conversation.entity';

export const CONVERSATION_REPOSITORY = Symbol('CONVERSATION_REPOSITORY');

// Read model for the admin inbox: one row per conversation with the data the
// admin list needs, computed by the repository to avoid N+1 queries.
export interface ConversationSummaryView {
  id: string;
  clientId: string;
  clientName: string | null;
  clientEmail: string;
  lastMessageAt: Date | null;
  lastMessagePreview: string | null;
  unreadCount: number;
}

export interface ConversationRepositoryPort {
  findByClientId(clientId: string): Promise<Conversation | null>;
  findById(id: string): Promise<Conversation | null>;
  create(clientId: string): Promise<Conversation>;
  // Ordered by lastMessageAt desc; includes client data and CLIENT-unread counts.
  findSummaries(limit: number): Promise<ConversationSummaryView[]>;
}
