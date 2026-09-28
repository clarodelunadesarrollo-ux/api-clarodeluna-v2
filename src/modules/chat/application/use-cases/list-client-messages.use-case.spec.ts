import { Conversation } from '../../domain/entities/conversation.entity';
import { ConversationRepositoryPort } from '../ports/out/conversation-repository.port';
import { MessageRepositoryPort } from '../ports/out/message-repository.port';
import { ListClientMessagesUseCase } from './list-client-messages.use-case';

const conversation = (): Conversation =>
  Conversation.rehydrate({
    id: 'c1',
    clientId: 'u1',
    lastMessageAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

describe('ListClientMessagesUseCase', () => {
  it('returns an empty list when the client has no conversation', async () => {
    const conversations = { findByClientId: jest.fn().mockResolvedValue(null) };
    const messages = { findByConversation: jest.fn() };
    const useCase = new ListClientMessagesUseCase(
      conversations as unknown as ConversationRepositoryPort,
      messages as unknown as MessageRepositoryPort,
    );

    await expect(useCase.execute('u1', null, 50)).resolves.toEqual([]);
    expect(messages.findByConversation).not.toHaveBeenCalled();
  });

  it('delegates to the repository with the cursor and limit', async () => {
    const conversations = {
      findByClientId: jest.fn().mockResolvedValue(conversation()),
    };
    const messages = { findByConversation: jest.fn().mockResolvedValue([]) };
    const useCase = new ListClientMessagesUseCase(
      conversations as unknown as ConversationRepositoryPort,
      messages as unknown as MessageRepositoryPort,
    );

    await useCase.execute('u1', 'cursor-id', 25);

    expect(messages.findByConversation).toHaveBeenCalledWith(
      'c1',
      'cursor-id',
      25,
    );
  });
});
