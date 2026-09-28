import { Message } from '../../domain/entities/message.entity';
import { MessageSenderType } from '../../domain/enums/message-sender-type.enum';
import { SendClientMessageUseCasePort } from '../ports/in/send-client-message.port';
import { ConversationRepositoryPort } from '../ports/out/conversation-repository.port';
import { MessageRepositoryPort } from '../ports/out/message-repository.port';

export class SendClientMessageUseCase implements SendClientMessageUseCasePort {
  constructor(
    private readonly conversations: ConversationRepositoryPort,
    private readonly messages: MessageRepositoryPort,
  ) {}

  async execute(clientId: string, rawBody: string): Promise<Message> {
    const body = Message.normalizeTextBody(rawBody);
    const conversation =
      (await this.conversations.findByClientId(clientId)) ??
      (await this.conversations.create(clientId));
    return this.messages.createText({
      conversationId: conversation.id,
      senderType: MessageSenderType.CLIENT,
      senderId: clientId,
      body,
    });
  }
}
