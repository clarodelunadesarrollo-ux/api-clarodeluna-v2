export const MARK_CLIENT_READ_USE_CASE = Symbol('MARK_CLIENT_READ_USE_CASE');

export interface MarkClientReadUseCasePort {
  execute(clientId: string): Promise<void>;
}
