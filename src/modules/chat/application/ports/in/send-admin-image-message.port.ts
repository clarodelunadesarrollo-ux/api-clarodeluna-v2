import { Message } from '../../../domain/entities/message.entity';

export const SEND_ADMIN_IMAGE_MESSAGE_USE_CASE = Symbol(
  'SEND_ADMIN_IMAGE_MESSAGE_USE_CASE',
);

export interface SendAdminImageMessageUseCasePort {
  execute(
    conversationId: string,
    adminId: string,
    buffer: Buffer,
    mimeType: string,
  ): Promise<Message>;
}
