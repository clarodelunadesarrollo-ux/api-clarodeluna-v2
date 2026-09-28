import { Message } from '../../../domain/entities/message.entity';

export const LIST_CONVERSATION_MESSAGES_USE_CASE = Symbol(
  'LIST_CONVERSATION_MESSAGES_USE_CASE',
);

export interface ListConversationMessagesUseCasePort {
  execute(
    conversationId: string,
    afterId: string | null,
    limit: number,
  ): Promise<Message[]>;
}
