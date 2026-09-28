import { MessageSenderType } from '../../domain/enums/message-sender-type.enum';
import { GetClientUnreadCountUseCasePort } from '../ports/in/get-client-unread-count.port';
import { ConversationRepositoryPort } from '../ports/out/conversation-repository.port';
import { MessageRepositoryPort } from '../ports/out/message-repository.port';

export class GetClientUnreadCountUseCase
  implements GetClientUnreadCountUseCasePort
{
  constructor(
    private readonly conversations: ConversationRepositoryPort,
    private readonly messages: MessageRepositoryPort,
  ) {}

  async execute(clientId: string): Promise<number> {
    const conversation = await this.conversations.findByClientId(clientId);
    if (!conversation) {
      return 0;
    }
    return this.messages.countUnread(conversation.id, MessageSenderType.ADMIN);
  }
}
