import { Message } from '../../../domain/entities/message.entity';

export const LIST_CLIENT_MESSAGES_USE_CASE = Symbol(
  'LIST_CLIENT_MESSAGES_USE_CASE',
);

export interface ListClientMessagesUseCasePort {
  execute(
    clientId: string,
    afterId: string | null,
    limit: number,
  ): Promise<Message[]>;
}
