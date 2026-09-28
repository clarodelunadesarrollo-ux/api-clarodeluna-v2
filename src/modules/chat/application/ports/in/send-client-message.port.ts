import { Message } from '../../../domain/entities/message.entity';

export const SEND_CLIENT_MESSAGE_USE_CASE = Symbol(
  'SEND_CLIENT_MESSAGE_USE_CASE',
);

export interface SendClientMessageUseCasePort {
  execute(clientId: string, body: string): Promise<Message>;
}
