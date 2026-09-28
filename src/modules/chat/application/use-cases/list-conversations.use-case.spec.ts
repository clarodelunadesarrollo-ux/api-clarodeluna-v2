import { ConversationRepositoryPort } from '../ports/out/conversation-repository.port';
import { ListConversationsUseCase } from './list-conversations.use-case';

describe('ListConversationsUseCase', () => {
  it('delegates to the repository summaries with the given limit', async () => {
    const summaries = [
      {
        id: 'c1',
        clientId: 'u1',
        clientName: 'Ada',
        clientEmail: 'ada@example.com',
        lastMessageAt: new Date(),
        lastMessagePreview: 'Hola',
        unreadCount: 2,
      },
    ];
    const conversations = {
      findSummaries: jest.fn().mockResolvedValue(summaries),
    };
    const useCase = new ListConversationsUseCase(
      conversations as unknown as ConversationRepositoryPort,
    );

    const result = await useCase.execute(50);

    expect(conversations.findSummaries).toHaveBeenCalledWith(50);
    expect(result).toBe(summaries);
  });
});
