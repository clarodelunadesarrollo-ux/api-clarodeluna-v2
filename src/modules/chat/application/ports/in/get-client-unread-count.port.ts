export const GET_CLIENT_UNREAD_COUNT_USE_CASE = Symbol(
  'GET_CLIENT_UNREAD_COUNT_USE_CASE',
);

export interface GetClientUnreadCountUseCasePort {
  execute(clientId: string): Promise<number>;
}
