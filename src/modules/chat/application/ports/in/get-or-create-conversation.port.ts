import { Conversation } from '../../../domain/entities/conversation.entity';

export const GET_OR_CREATE_CONVERSATION_USE_CASE = Symbol(
  'GET_OR_CREATE_CONVERSATION_USE_CASE',
);

export interface ConversationWithUnread {
  conversation: Conversation;
  unreadCount: number;
}

export interface GetOrCreateConversationUseCasePort {
  execute(clientId: string): Promise<ConversationWithUnread>;
}
