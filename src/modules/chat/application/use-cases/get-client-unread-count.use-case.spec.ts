import { Conversation } from '../../domain/entities/conversation.entity';
import { MessageSenderType } from '../../domain/enums/message-sender-type.enum';
import { ConversationRepositoryPort } from '../ports/out/conversation-repository.port';
import { MessageRepositoryPort } from '../ports/out/message-repository.port';
import { GetClientUnreadCountUseCase } from './get-client-unread-count.use-case';

const conversation = (): Conversation =>
  Conversation.rehydrate({
    id: 'c1',
    clientId: 'u1',
    lastMessageAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

describe('GetClientUnreadCountUseCase', () => {
  it('returns 0 when the client has no conversation', async () => {
    const conversations = { findByClientId: jest.fn().mockResolvedValue(null) };
    const messages = { countUnread: jest.fn() };
    const useCase = new GetClientUnreadCountUseCase(
      conversations as unknown as ConversationRepositoryPort,
      messages as unknown as MessageRepositoryPort,
    );

    await expect(useCase.execute('u1')).resolves.toBe(0);
    expect(messages.countUnread).not.toHaveBeenCalled();
  });

  it('counts unread ADMIN messages for the client conversation', async () => {
    const conversations = {
      findByClientId: jest.fn().mockResolvedValue(conversation()),
    };
    const messages = { countUnread: jest.fn().mockResolvedValue(5) };
    const useCase = new GetClientUnreadCountUseCase(
      conversations as unknown as ConversationRepositoryPort,
      messages as unknown as MessageRepositoryPort,
    );

    await expect(useCase.execute('u1')).resolves.toBe(5);
    expect(messages.countUnread).toHaveBeenCalledWith(
      'c1',
      MessageSenderType.ADMIN,
    );
  });
});
