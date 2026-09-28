import { MessageSenderType } from '../../domain/enums/message-sender-type.enum';
import { ReadState } from '../ports/in/get-client-read-state.port';
import {
    GetConversationReadStateUseCasePort,
} from '../ports/in/get-conversation-read-state.port';
import { MessageRepositoryPort } from '../ports/out/message-repository.port';

/**
 * Read-receipt state for the admin side: when the client last read the admin's
 * (ADMIN-authored) messages in the given conversation. Powers the green ticks
 * on the admin's own messages.
 */
export class GetConversationReadStateUseCase
  implements GetConversationReadStateUseCasePort
{
  constructor(private readonly messages: MessageRepositoryPort) {}

  async execute(conversationId: string): Promise<ReadState> {
    const partnerLastReadAt = await this.messages.lastReadAtForSender(
      conversationId,
      MessageSenderType.ADMIN,
    );
    return { partnerLastReadAt };
  }
}
