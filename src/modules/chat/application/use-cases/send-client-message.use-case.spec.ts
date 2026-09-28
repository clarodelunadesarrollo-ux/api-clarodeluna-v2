import { Conversation } from '../../domain/entities/conversation.entity';
import { Message } from '../../domain/entities/message.entity';
import { MessageSenderType } from '../../domain/enums/message-sender-type.enum';
import { MessageType } from '../../domain/enums/message-type.enum';
import { InvalidMessageException } from '../../domain/exceptions/invalid-message.exception';
import { ConversationRepositoryPort } from '../ports/out/conversation-repository.port';
import { MessageRepositoryPort } from '../ports/out/message-repository.port';
import { SendClientMessageUseCase } from './send-client-message.use-case';

const conversation = (): Conversation =>
  Conversation.rehydrate({
    id: 'c1',
    clientId: 'u1',
    lastMessageAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

const message = (): Message =>
  Message.rehydrate({
    id: 'm1',
    conversationId: 'c1',
    senderType: MessageSenderType.CLIENT,
    senderId: 'u1',
    type: MessageType.TEXT,
    body: 'Hola',
    imageUrl: null,
    readAt: null,
    createdAt: new Date(),
  });

describe('SendClientMessageUseCase', () => {
  let conversations: {
    findByClientId: jest.Mock;
    findById: jest.Mock;
    create: jest.Mock;
    findSummaries: jest.Mock;
  };
  let messages: {
    findByConversation: jest.Mock;
    createText: jest.Mock;
    countUnread: jest.Mock;
    markRead: jest.Mock;
  };
  let useCase: SendClientMessageUseCase;

  beforeEach(() => {
    conversations = {
      findByClientId: jest.fn(),
      findById: jest.fn(),
      create: jest.fn(),
      findSummaries: jest.fn(),
    };
    messages = {
      findByConversation: jest.fn(),
      createText: jest.fn(),
      countUnread: jest.fn(),
      markRead: jest.fn(),
    };
    useCase = new SendClientMessageUseCase(
      conversations as unknown as ConversationRepositoryPort,
      messages as unknown as MessageRepositoryPort,
    );
  });

  it('rejects a whitespace-only body without touching persistence', async () => {
    await expect(useCase.execute('u1', '   ')).rejects.toBeInstanceOf(
      InvalidMessageException,
    );
    expect(conversations.findByClientId).not.toHaveBeenCalled();
    expect(messages.createText).not.toHaveBeenCalled();
  });

  it('trims the body and creates a CLIENT message, creating the conversation if needed', async () => {
    conversations.findByClientId.mockResolvedValue(null);
    conversations.create.mockResolvedValue(conversation());
    messages.createText.mockResolvedValue(message());

    await useCase.execute('u1', '  Hola  ');

    expect(conversations.create).toHaveBeenCalledWith('u1');
    expect(messages.createText).toHaveBeenCalledWith({
      conversationId: 'c1',
      senderType: MessageSenderType.CLIENT,
      senderId: 'u1',
      body: 'Hola',
    });
  });
});
