import { Message } from '../../domain/entities/message.entity';
import { MessageSenderType } from '../../domain/enums/message-sender-type.enum';
import { ConversationNotFoundException } from '../../domain/exceptions/conversation-not-found.exception';
import { SendAdminImageMessageUseCasePort } from '../ports/in/send-admin-image-message.port';
import { ConversationRepositoryPort } from '../ports/out/conversation-repository.port';
import { ImageStoragePort } from '../ports/out/image-storage.port';
import { MessageRepositoryPort } from '../ports/out/message-repository.port';

export class SendAdminImageMessageUseCase
  implements SendAdminImageMessageUseCasePort
{
  constructor(
    private readonly conversations: ConversationRepositoryPort,
    private readonly messages: MessageRepositoryPort,
    private readonly storage: ImageStoragePort,
  ) {}

  async execute(
    conversationId: string,
    adminId: string,
    buffer: Buffer,
    mimeType: string,
  ): Promise<Message> {
    Message.validateImageUpload(mimeType, buffer.length);
    const conversation = await this.conversations.findById(conversationId);
    if (!conversation) {
      throw new ConversationNotFoundException();
    }
    const uploaded = await this.storage.upload({ buffer, mimeType });
    return this.messages.createImage({
      conversationId,
      senderType: MessageSenderType.ADMIN,
      senderId: adminId,
      imageUrl: uploaded.url,
    });
  }
}
