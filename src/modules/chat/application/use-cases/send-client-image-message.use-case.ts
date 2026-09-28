import { Message } from '../../domain/entities/message.entity';
import { MessageSenderType } from '../../domain/enums/message-sender-type.enum';
import { SendClientImageMessageUseCasePort } from '../ports/in/send-client-image-message.port';
import { ConversationRepositoryPort } from '../ports/out/conversation-repository.port';
import { ImageStoragePort } from '../ports/out/image-storage.port';
import { MessageRepositoryPort } from '../ports/out/message-repository.port';

export class SendClientImageMessageUseCase
  implements SendClientImageMessageUseCasePort
{
  constructor(
    private readonly conversations: ConversationRepositoryPort,
    private readonly messages: MessageRepositoryPort,
    private readonly storage: ImageStoragePort,
  ) {}

  async execute(
    clientId: string,
    buffer: Buffer,
    mimeType: string,
  ): Promise<Message> {
    Message.validateImageUpload(mimeType, buffer.length);
    const conversation =
      (await this.conversations.findByClientId(clientId)) ??
      (await this.conversations.create(clientId));
    const uploaded = await this.storage.upload({ buffer, mimeType });
    return this.messages.createImage({
      conversationId: conversation.id,
      senderType: MessageSenderType.CLIENT,
      senderId: clientId,
      imageUrl: uploaded.url,
    });
  }
}
