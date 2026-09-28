import { Conversation } from '../../domain/entities/conversation.entity';
import { MessageSenderType } from '../../domain/enums/message-sender-type.enum';
import { ConversationNotFoundException } from '../../domain/exceptions/conversation-not-found.exception';
import { ConversationRepositoryPort } from '../ports/out/conversation-repository.port';
import { MessageRepositoryPort } from '../ports/out/message-repository.port';
import { MarkAdminReadUseCase } from './mark-admin-read.use-case';

const conversation = (): Conversation =>
  Conversation.rehydrate({
    id: 'c1',
    clientId: 'u1',
    lastMessageAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

describe('MarkAdminReadUseCase', () => {
  it('throws when the conversation does not exist', async () => {
    const conversations = { findById: jest.fn().mockResolvedValue(null) };
    const messages = { markRead: jest.fn() };
    const useCase = new MarkAdminReadUseCase(
      conversations as unknown as ConversationRepositoryPort,
      messages as unknown as MessageRepositoryPort,
    );

    await expect(useCase.execute('missing')).rejects.toBeInstanceOf(
      ConversationNotFoundException,
    );
    expect(messages.markRead).not.toHaveBeenCalled();
  });

  it('marks CLIENT messages as read for the conversation', async () => {
    const conversations = {
      findById: jest.fn().mockResolvedValue(conversation()),
    };
    const messages = { markRead: jest.fn().mockResolvedValue(undefined) };
    const useCase = new MarkAdminReadUseCase(
      conversations as unknown as ConversationRepositoryPort,
      messages as unknown as MessageRepositoryPort,
    );

    await useCase.execute('c1');

    expect(messages.markRead).toHaveBeenCalledWith(
      'c1',
      MessageSenderType.CLIENT,
    );
  });
});
