export const MARK_ADMIN_READ_USE_CASE = Symbol('MARK_ADMIN_READ_USE_CASE');

export interface MarkAdminReadUseCasePort {
  execute(conversationId: string): Promise<void>;
}
