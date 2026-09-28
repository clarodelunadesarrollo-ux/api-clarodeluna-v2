import { MessageSenderType } from '../../domain/enums/message-sender-type.enum';
import {
    ConversationWithUnread,
    GetOrCreateConversationUseCasePort,
} from '../ports/in/get-or-create-conversation.port';
import { ConversationRepositoryPort } from '../ports/out/conversation-repository.port';
import { MessageRepositoryPort } from '../ports/out/message-repository.port';

export class GetOrCreateConversationUseCase
  implements GetOrCreateConversationUseCasePort
{
  constructor(
    private readonly conversations: ConversationRepositoryPort,
    private readonly messages: MessageRepositoryPort,
  ) {}

  async execute(clientId: string): Promise<ConversationWithUnread> {
    const conversation =
      (await this.conversations.findByClientId(clientId)) ??
      (await this.conversations.create(clientId));
    const unreadCount = await this.messages.countUnread(
      conversation.id,
      MessageSenderType.ADMIN,
    );
    return { conversation, unreadCount };
  }
}
