import { Message } from '../../domain/entities/message.entity';
import { ListClientMessagesUseCasePort } from '../ports/in/list-client-messages.port';
import { ConversationRepositoryPort } from '../ports/out/conversation-repository.port';
import { MessageRepositoryPort } from '../ports/out/message-repository.port';

export class ListClientMessagesUseCase
  implements ListClientMessagesUseCasePort
{
  constructor(
    private readonly conversations: ConversationRepositoryPort,
    private readonly messages: MessageRepositoryPort,
  ) {}

  async execute(
    clientId: string,
    afterId: string | null,
    limit: number,
  ): Promise<Message[]> {
    const conversation = await this.conversations.findByClientId(clientId);
    if (!conversation) {
      return [];
    }
    return this.messages.findByConversation(conversation.id, afterId, limit);
  }
}
