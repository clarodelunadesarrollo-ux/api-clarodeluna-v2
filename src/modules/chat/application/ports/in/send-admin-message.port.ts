import { Message } from '../../../domain/entities/message.entity';

export const SEND_ADMIN_MESSAGE_USE_CASE = Symbol('SEND_ADMIN_MESSAGE_USE_CASE');

export interface SendAdminMessageUseCasePort {
  execute(conversationId: string, adminId: string, body: string): Promise<Message>;
}
