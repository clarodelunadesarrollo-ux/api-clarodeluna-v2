import { Message } from '../../../domain/entities/message.entity';

export const SEND_CLIENT_IMAGE_MESSAGE_USE_CASE = Symbol(
  'SEND_CLIENT_IMAGE_MESSAGE_USE_CASE',
);

export interface SendClientImageMessageUseCasePort {
  execute(clientId: string, buffer: Buffer, mimeType: string): Promise<Message>;
}
