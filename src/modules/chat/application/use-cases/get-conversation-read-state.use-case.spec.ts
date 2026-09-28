import { MessageSenderType } from '../../domain/enums/message-sender-type.enum';
import { MessageRepositoryPort } from '../ports/out/message-repository.port';
import { GetConversationReadStateUseCase } from './get-conversation-read-state.use-case';

describe('GetConversationReadStateUseCase', () => {
  it('returns the latest readAt of the admin-authored messages', async () => {
    const readAt = new Date('2026-09-27T15:10:00.000Z');
    const messages = {
      lastReadAtForSender: jest.fn().mockResolvedValue(readAt),
    };
    const useCase = new GetConversationReadStateUseCase(
      messages as unknown as MessageRepositoryPort,
    );

    await expect(useCase.execute('c1')).resolves.toEqual({
      partnerLastReadAt: readAt,
    });
    expect(messages.lastReadAtForSender).toHaveBeenCalledWith(
      'c1',
      MessageSenderType.ADMIN,
    );
  });

  it('returns null when nothing has been read yet', async () => {
    const messages = {
      lastReadAtForSender: jest.fn().mockResolvedValue(null),
    };
    const useCase = new GetConversationReadStateUseCase(
      messages as unknown as MessageRepositoryPort,
    );

    await expect(useCase.execute('c1')).resolves.toEqual({
      partnerLastReadAt: null,
    });
  });
});
