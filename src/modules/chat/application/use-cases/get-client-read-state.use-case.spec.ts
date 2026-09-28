import { Conversation } from '../../domain/entities/conversation.entity';
import { MessageSenderType } from '../../domain/enums/message-sender-type.enum';
import { ConversationRepositoryPort } from '../ports/out/conversation-repository.port';
import { MessageRepositoryPort } from '../ports/out/message-repository.port';
import { GetClientReadStateUseCase } from './get-client-read-state.use-case';

const conversation = (): Conversation =>
  Conversation.rehydrate({
    id: 'c1',
    clientId: 'u1',
    lastMessageAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

describe('GetClientReadStateUseCase', () => {
  it('returns null when the client has no conversation', async () => {
    const conversations = { findByClientId: jest.fn().mockResolvedValue(null) };
    const messages = { lastReadAtForSender: jest.fn() };
    const useCase = new GetClientReadStateUseCase(
      conversations as unknown as ConversationRepositoryPort,
      messages as unknown as MessageRepositoryPort,
    );

    await expect(useCase.execute('u1')).resolves.toEqual({
      partnerLastReadAt: null,
    });
    expect(messages.lastReadAtForSender).not.toHaveBeenCalled();
  });

  it('returns the latest readAt of the client-authored messages', async () => {
    const readAt = new Date('2026-09-27T14:40:00.000Z');
    const conversations = {
      findByClientId: jest.fn().mockResolvedValue(conversation()),
    };
    const messages = {
      lastReadAtForSender: jest.fn().mockResolvedValue(readAt),
    };
    const useCase = new GetClientReadStateUseCase(
      conversations as unknown as ConversationRepositoryPort,
      messages as unknown as MessageRepositoryPort,
    );

    await expect(useCase.execute('u1')).resolves.toEqual({
      partnerLastReadAt: readAt,
    });
    expect(messages.lastReadAtForSender).toHaveBeenCalledWith(
      'c1',
      MessageSenderType.CLIENT,
    );
  });
});
