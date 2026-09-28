import { ConversationSummaryView } from '../out/conversation-repository.port';

export const LIST_CONVERSATIONS_USE_CASE = Symbol('LIST_CONVERSATIONS_USE_CASE');

export interface ListConversationsUseCasePort {
  execute(limit: number): Promise<ConversationSummaryView[]>;
}
