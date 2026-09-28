import { MessageSenderType } from '../../domain/enums/message-sender-type.enum';
import { ConversationNotFoundException } from '../../domain/exceptions/conversation-not-found.exception';
import { MarkAdminReadUseCasePort } from '../ports/in/mark-admin-read.port';
import { ConversationRepositoryPort } from '../ports/out/conversation-repository.port';
import { MessageRepositoryPort } from '../ports/out/message-repository.port';

export class MarkAdminReadUseCase implements MarkAdminReadUseCasePort {
  constructor(
    private readonly conversations: ConversationRepositoryPort,
    private readonly messages: MessageRepositoryPort,
  ) {}

  async execute(conversationId: string): Promise<void> {
    const conversation = await this.conversations.findById(conversationId);
    if (!conversation) {
      throw new ConversationNotFoundException();
    }
    await this.messages.markRead(conversationId, MessageSenderType.CLIENT);
  }
}
