import { Conversation } from '../../domain/entities/conversation.entity';
import { MAX_IMAGE_BYTES, Message } from '../../domain/entities/message.entity';
import { MessageSenderType } from '../../domain/enums/message-sender-type.enum';
import { MessageType } from '../../domain/enums/message-type.enum';
import { ConversationNotFoundException } from '../../domain/exceptions/conversation-not-found.exception';
import { InvalidMessageException } from '../../domain/exceptions/invalid-message.exception';
import { ConversationRepositoryPort } from '../ports/out/conversation-repository.port';
import { ImageStoragePort } from '../ports/out/image-storage.port';
import { MessageRepositoryPort } from '../ports/out/message-repository.port';
import { SendAdminImageMessageUseCase } from './send-admin-image-message.use-case';

const conversation = (): Conversation =>
  Conversation.rehydrate({
    id: 'c1',
    clientId: 'u1',
    lastMessageAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

const adminImageMessage = (): Message =>
  Message.rehydrate({
    id: 'm1',
    conversationId: 'c1',
    senderType: MessageSenderType.ADMIN,
    senderId: 'admin1',
    type: MessageType.IMAGE,
    body: null,
    imageUrl: 'https://cdn.example.com/chat/pic.png',
    readAt: null,
    createdAt: new Date(),
  });

describe('SendAdminImageMessageUseCase', () => {
  let conversations: { findById: jest.Mock };
  let messages: { createImage: jest.Mock };
  let storage: { upload: jest.Mock };
  let useCase: SendAdminImageMessageUseCase;

  beforeEach(() => {
    conversations = { findById: jest.fn() };
    messages = { createImage: jest.fn() };
    storage = { upload: jest.fn() };
    useCase = new SendAdminImageMessageUseCase(
      conversations as unknown as ConversationRepositoryPort,
      messages as unknown as MessageRepositoryPort,
      storage as unknown as ImageStoragePort,
    );
  });

  it('rejects an unsupported mime type before hitting persistence', async () => {
    await expect(
      useCase.execute('c1', 'admin1', Buffer.from('x'), 'application/pdf'),
    ).rejects.toBeInstanceOf(InvalidMessageException);
    expect(conversations.findById).not.toHaveBeenCalled();
    expect(storage.upload).not.toHaveBeenCalled();
  });

  it('rejects a file larger than the max size before hitting persistence', async () => {
    const oversized = { length: MAX_IMAGE_BYTES + 1 } as unknown as Buffer;
    await expect(
      useCase.execute('c1', 'admin1', oversized, 'image/png'),
    ).rejects.toBeInstanceOf(InvalidMessageException);
    expect(conversations.findById).not.toHaveBeenCalled();
  });

  it('throws when the conversation does not exist', async () => {
    conversations.findById.mockResolvedValue(null);

    await expect(
      useCase.execute('missing', 'admin1', Buffer.from('x'), 'image/png'),
    ).rejects.toBeInstanceOf(ConversationNotFoundException);
    expect(storage.upload).not.toHaveBeenCalled();
    expect(messages.createImage).not.toHaveBeenCalled();
  });

  it('uploads the image and creates an ADMIN image message', async () => {
    conversations.findById.mockResolvedValue(conversation());
    storage.upload.mockResolvedValue({
      url: 'https://cdn.example.com/chat/pic.png',
    });
    messages.createImage.mockResolvedValue(adminImageMessage());

    const buffer = Buffer.from('binary');
    await useCase.execute('c1', 'admin1', buffer, 'image/png');

    expect(storage.upload).toHaveBeenCalledWith({
      buffer,
      mimeType: 'image/png',
    });
    expect(messages.createImage).toHaveBeenCalledWith({
      conversationId: 'c1',
      senderType: MessageSenderType.ADMIN,
      senderId: 'admin1',
      imageUrl: 'https://cdn.example.com/chat/pic.png',
    });
  });
});
