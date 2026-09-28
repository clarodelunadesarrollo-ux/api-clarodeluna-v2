import { Conversation } from '../../domain/entities/conversation.entity';
import { Message } from '../../domain/entities/message.entity';
import { MessageSenderType } from '../../domain/enums/message-sender-type.enum';
import { MessageType } from '../../domain/enums/message-type.enum';
import { ConversationNotFoundException } from '../../domain/exceptions/conversation-not-found.exception';
import { InvalidMessageException } from '../../domain/exceptions/invalid-message.exception';
import { ConversationRepositoryPort } from '../ports/out/conversation-repository.port';
import { MessageRepositoryPort } from '../ports/out/message-repository.port';
import { SendAdminMessageUseCase } from './send-admin-message.use-case';

const conversation = (): Conversation =>
  Conversation.rehydrate({
    id: 'c1',
    clientId: 'u1',
    lastMessageAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

const adminMessage = (): Message =>
  Message.rehydrate({
    id: 'm1',
    conversationId: 'c1',
    senderType: MessageSenderType.ADMIN,
    senderId: 'admin1',
    type: MessageType.TEXT,
    body: 'Hola',
    imageUrl: null,
    readAt: null,
    createdAt: new Date(),
  });

describe('SendAdminMessageUseCase', () => {
  it('rejects an empty body before hitting persistence', async () => {
    const conversations = { findById: jest.fn() };
    const messages = { createText: jest.fn() };
    const useCase = new SendAdminMessageUseCase(
      conversations as unknown as ConversationRepositoryPort,
      messages as unknown as MessageRepositoryPort,
    );

    await expect(
      useCase.execute('c1', 'admin1', '   '),
    ).rejects.toBeInstanceOf(InvalidMessageException);
    expect(conversations.findById).not.toHaveBeenCalled();
  });

  it('throws when the conversation does not exist', async () => {
    const conversations = { findById: jest.fn().mockResolvedValue(null) };
    const messages = { createText: jest.fn() };
    const useCase = new SendAdminMessageUseCase(
      conversations as unknown as ConversationRepositoryPort,
      messages as unknown as MessageRepositoryPort,
    );

    await expect(
      useCase.execute('missing', 'admin1', 'Hola'),
    ).rejects.toBeInstanceOf(ConversationNotFoundException);
    expect(messages.createText).not.toHaveBeenCalled();
  });

  it('creates an ADMIN message authored by the admin', async () => {
    const conversations = {
      findById: jest.fn().mockResolvedValue(conversation()),
    };
    const messages = {
      createText: jest.fn().mockResolvedValue(adminMessage()),
    };
    const useCase = new SendAdminMessageUseCase(
      conversations as unknown as ConversationRepositoryPort,
      messages as unknown as MessageRepositoryPort,
    );

    await useCase.execute('c1', 'admin1', '  Hola  ');

    expect(messages.createText).toHaveBeenCalledWith({
      conversationId: 'c1',
      senderType: MessageSenderType.ADMIN,
      senderId: 'admin1',
      body: 'Hola',
    });
  });
});
