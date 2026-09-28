import { MessageSenderType } from '../../domain/enums/message-sender-type.enum';
import { MarkClientReadUseCasePort } from '../ports/in/mark-client-read.port';
import { ConversationRepositoryPort } from '../ports/out/conversation-repository.port';
import { MessageRepositoryPort } from '../ports/out/message-repository.port';

export class MarkClientReadUseCase implements MarkClientReadUseCasePort {
  constructor(
    private readonly conversations: ConversationRepositoryPort,
    private readonly messages: MessageRepositoryPort,
  ) {}

  async execute(clientId: string): Promise<void> {
    const conversation = await this.conversations.findByClientId(clientId);
    if (!conversation) {
      return;
    }
    await this.messages.markRead(conversation.id, MessageSenderType.ADMIN);
  }
}
