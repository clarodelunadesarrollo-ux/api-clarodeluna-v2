import { Message } from '../../domain/entities/message.entity';
import { MessageSenderType } from '../../domain/enums/message-sender-type.enum';
import { ConversationNotFoundException } from '../../domain/exceptions/conversation-not-found.exception';
import { SendAdminMessageUseCasePort } from '../ports/in/send-admin-message.port';
import { ConversationRepositoryPort } from '../ports/out/conversation-repository.port';
import { MessageRepositoryPort } from '../ports/out/message-repository.port';

export class SendAdminMessageUseCase implements SendAdminMessageUseCasePort {
  constructor(
    private readonly conversations: ConversationRepositoryPort,
    private readonly messages: MessageRepositoryPort,
  ) {}

  async execute(
    conversationId: string,
    adminId: string,
    rawBody: string,
  ): Promise<Message> {
    const body = Message.normalizeTextBody(rawBody);
    const conversation = await this.conversations.findById(conversationId);
    if (!conversation) {
      throw new ConversationNotFoundException();
    }
    return this.messages.createText({
      conversationId,
      senderType: MessageSenderType.ADMIN,
      senderId: adminId,
      body,
    });
  }
}
