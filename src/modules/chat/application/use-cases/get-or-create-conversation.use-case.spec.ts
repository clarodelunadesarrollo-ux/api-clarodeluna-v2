import { Conversation } from '../../domain/entities/conversation.entity';
import { MessageSenderType } from '../../domain/enums/message-sender-type.enum';
import { ConversationRepositoryPort } from '../ports/out/conversation-repository.port';
import { MessageRepositoryPort } from '../ports/out/message-repository.port';
import { GetOrCreateConversationUseCase } from './get-or-create-conversation.use-case';

const buildConversation = (id: string, clientId: string): Conversation =>
  Conversation.rehydrate({
    id,
    clientId,
    lastMessageAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

describe('GetOrCreateConversationUseCase', () => {
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
  let useCase: GetOrCreateConversationUseCase;

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
    useCase = new GetOrCreateConversationUseCase(
      conversations as unknown as ConversationRepositoryPort,
      messages as unknown as MessageRepositoryPort,
    );
  });

  it('reuses the existing conversation and returns the unread count', async () => {
    conversations.findByClientId.mockResolvedValue(buildConversation('c1', 'u1'));
    messages.countUnread.mockResolvedValue(3);

    const result = await useCase.execute('u1');

    expect(conversations.create).not.toHaveBeenCalled();
    expect(messages.countUnread).toHaveBeenCalledWith(
      'c1',
      MessageSenderType.ADMIN,
    );
    expect(result).toEqual({
      conversation: expect.objectContaining({ id: 'c1' }),
      unreadCount: 3,
    });
  });

  it('creates the conversation when the client has none yet', async () => {
    conversations.findByClientId.mockResolvedValue(null);
    conversations.create.mockResolvedValue(buildConversation('c2', 'u1'));
    messages.countUnread.mockResolvedValue(0);

    const result = await useCase.execute('u1');

    expect(conversations.create).toHaveBeenCalledWith('u1');
    expect(result.unreadCount).toBe(0);
    expect(result.conversation.id).toBe('c2');
  });
});
