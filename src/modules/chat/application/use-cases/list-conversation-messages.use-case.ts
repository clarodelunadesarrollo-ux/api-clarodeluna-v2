import { Message } from '../../domain/entities/message.entity';
import { ConversationNotFoundException } from '../../domain/exceptions/conversation-not-found.exception';
import { ListConversationMessagesUseCasePort } from '../ports/in/list-conversation-messages.port';
import { ConversationRepositoryPort } from '../ports/out/conversation-repository.port';
import { MessageRepositoryPort } from '../ports/out/message-repository.port';

export class ListConversationMessagesUseCase
  implements ListConversationMessagesUseCasePort
{
  constructor(
    private readonly conversations: ConversationRepositoryPort,
    private readonly messages: MessageRepositoryPort,
  ) {}

  async execute(
    conversationId: string,
    afterId: string | null,
    limit: number,
  ): Promise<Message[]> {
    const conversation = await this.conversations.findById(conversationId);
    if (!conversation) {
      throw new ConversationNotFoundException();
    }
    return this.messages.findByConversation(conversationId, afterId, limit);
  }
}
