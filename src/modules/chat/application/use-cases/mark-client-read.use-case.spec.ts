import { Conversation } from '../../domain/entities/conversation.entity';
import { MessageSenderType } from '../../domain/enums/message-sender-type.enum';
import { ConversationRepositoryPort } from '../ports/out/conversation-repository.port';
import { MessageRepositoryPort } from '../ports/out/message-repository.port';
import { MarkClientReadUseCase } from './mark-client-read.use-case';

const conversation = (): Conversation =>
  Conversation.rehydrate({
    id: 'c1',
    clientId: 'u1',
    lastMessageAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

describe('MarkClientReadUseCase', () => {
  it('does nothing when the client has no conversation', async () => {
    const conversations = { findByClientId: jest.fn().mockResolvedValue(null) };
    const messages = { markRead: jest.fn() };
    const useCase = new MarkClientReadUseCase(
      conversations as unknown as ConversationRepositoryPort,
      messages as unknown as MessageRepositoryPort,
    );

    await useCase.execute('u1');

    expect(messages.markRead).not.toHaveBeenCalled();
  });

  it('marks ADMIN messages as read for the client conversation', async () => {
    const conversations = {
      findByClientId: jest.fn().mockResolvedValue(conversation()),
    };
    const messages = { markRead: jest.fn().mockResolvedValue(undefined) };
    const useCase = new MarkClientReadUseCase(
      conversations as unknown as ConversationRepositoryPort,
      messages as unknown as MessageRepositoryPort,
    );

    await useCase.execute('u1');

    expect(messages.markRead).toHaveBeenCalledWith('c1', MessageSenderType.ADMIN);
  });
});
