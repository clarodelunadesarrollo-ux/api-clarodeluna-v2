import { MessageSenderType } from '../../domain/enums/message-sender-type.enum';
import {
    GetClientReadStateUseCasePort,
    ReadState,
} from '../ports/in/get-client-read-state.port';
import { ConversationRepositoryPort } from '../ports/out/conversation-repository.port';
import { MessageRepositoryPort } from '../ports/out/message-repository.port';

/**
 * Read-receipt state for the client: when the admin last read the client's
 * (CLIENT-authored) messages. Any own message with createdAt <= this value is
 * shown as "read" (green ticks) on the client. Null when no conversation yet
 * or nothing has been read.
 */
export class GetClientReadStateUseCase implements GetClientReadStateUseCasePort {
  constructor(
    private readonly conversations: ConversationRepositoryPort,
    private readonly messages: MessageRepositoryPort,
  ) {}

  async execute(clientId: string): Promise<ReadState> {
    const conversation = await this.conversations.findByClientId(clientId);
    if (!conversation) {
      return { partnerLastReadAt: null };
    }
    const partnerLastReadAt = await this.messages.lastReadAtForSender(
      conversation.id,
      MessageSenderType.CLIENT,
    );
    return { partnerLastReadAt };
  }
}
