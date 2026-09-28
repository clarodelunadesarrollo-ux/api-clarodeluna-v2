import { Conversation } from '../../domain/entities/conversation.entity';
import { ConversationNotFoundException } from '../../domain/exceptions/conversation-not-found.exception';
import { ConversationRepositoryPort } from '../ports/out/conversation-repository.port';
import { MessageRepositoryPort } from '../ports/out/message-repository.port';
import { ListConversationMessagesUseCase } from './list-conversation-messages.use-case';

const conversation = (): Conversation =>
  Conversation.rehydrate({
    id: 'c1',
    clientId: 'u1',
    lastMessageAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

describe('ListConversationMessagesUseCase', () => {
  it('throws when the conversation does not exist', async () => {
    const conversations = { findById: jest.fn().mockResolvedValue(null) };
    const messages = { findByConversation: jest.fn() };
    const useCase = new ListConversationMessagesUseCase(
      conversations as unknown as ConversationRepositoryPort,
      messages as unknown as MessageRepositoryPort,
    );

    await expect(useCase.execute('missing', null, 50)).rejects.toBeInstanceOf(
      ConversationNotFoundException,
    );
    expect(messages.findByConversation).not.toHaveBeenCalled();
  });

  it('returns the messages when the conversation exists', async () => {
    const conversations = {
      findById: jest.fn().mockResolvedValue(conversation()),
    };
    const messages = { findByConversation: jest.fn().mockResolvedValue([]) };
    const useCase = new ListConversationMessagesUseCase(
      conversations as unknown as ConversationRepositoryPort,
      messages as unknown as MessageRepositoryPort,
    );

    await useCase.execute('c1', 'cursor-id', 10);

    expect(messages.findByConversation).toHaveBeenCalledWith(
      'c1',
      'cursor-id',
      10,
    );
  });
});
