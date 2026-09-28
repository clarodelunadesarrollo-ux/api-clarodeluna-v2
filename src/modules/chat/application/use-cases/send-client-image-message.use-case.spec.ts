import { Conversation } from '../../domain/entities/conversation.entity';
import { MAX_IMAGE_BYTES, Message } from '../../domain/entities/message.entity';
import { MessageSenderType } from '../../domain/enums/message-sender-type.enum';
import { MessageType } from '../../domain/enums/message-type.enum';
import { InvalidMessageException } from '../../domain/exceptions/invalid-message.exception';
import { ConversationRepositoryPort } from '../ports/out/conversation-repository.port';
import { ImageStoragePort } from '../ports/out/image-storage.port';
import { MessageRepositoryPort } from '../ports/out/message-repository.port';
import { SendClientImageMessageUseCase } from './send-client-image-message.use-case';

const conversation = (): Conversation =>
  Conversation.rehydrate({
    id: 'c1',
    clientId: 'u1',
    lastMessageAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

const imageMessage = (): Message =>
  Message.rehydrate({
    id: 'm1',
    conversationId: 'c1',
    senderType: MessageSenderType.CLIENT,
    senderId: 'u1',
    type: MessageType.IMAGE,
    body: null,
    imageUrl: 'https://cdn.example.com/chat/pic.jpg',
    readAt: null,
    createdAt: new Date(),
  });

describe('SendClientImageMessageUseCase', () => {
  let conversations: {
    findByClientId: jest.Mock;
    create: jest.Mock;
  };
  let messages: { createImage: jest.Mock };
  let storage: { upload: jest.Mock };
  let useCase: SendClientImageMessageUseCase;

  beforeEach(() => {
    conversations = { findByClientId: jest.fn(), create: jest.fn() };
    messages = { createImage: jest.fn() };
    storage = { upload: jest.fn() };
    useCase = new SendClientImageMessageUseCase(
      conversations as unknown as ConversationRepositoryPort,
      messages as unknown as MessageRepositoryPort,
      storage as unknown as ImageStoragePort,
    );
  });

  it('rejects an unsupported mime type before uploading', async () => {
    await expect(
      useCase.execute('u1', Buffer.from('x'), 'image/gif'),
    ).rejects.toBeInstanceOf(InvalidMessageException);
    expect(storage.upload).not.toHaveBeenCalled();
    expect(messages.createImage).not.toHaveBeenCalled();
  });

  it('rejects a file larger than the max size before uploading', async () => {
    const oversized = { length: MAX_IMAGE_BYTES + 1 } as unknown as Buffer;
    await expect(
      useCase.execute('u1', oversized, 'image/jpeg'),
    ).rejects.toBeInstanceOf(InvalidMessageException);
    expect(storage.upload).not.toHaveBeenCalled();
  });

  it('uploads the image and creates a CLIENT image message, creating the conversation if needed', async () => {
    conversations.findByClientId.mockResolvedValue(null);
    conversations.create.mockResolvedValue(conversation());
    storage.upload.mockResolvedValue({
      url: 'https://cdn.example.com/chat/pic.jpg',
    });
    messages.createImage.mockResolvedValue(imageMessage());

    const buffer = Buffer.from('binary');
    await useCase.execute('u1', buffer, 'image/jpeg');

    expect(conversations.create).toHaveBeenCalledWith('u1');
    expect(storage.upload).toHaveBeenCalledWith({
      buffer,
      mimeType: 'image/jpeg',
    });
    expect(messages.createImage).toHaveBeenCalledWith({
      conversationId: 'c1',
      senderType: MessageSenderType.CLIENT,
      senderId: 'u1',
      imageUrl: 'https://cdn.example.com/chat/pic.jpg',
    });
  });
});
