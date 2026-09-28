export const GET_CLIENT_READ_STATE_USE_CASE = Symbol(
  'GET_CLIENT_READ_STATE_USE_CASE',
);

export interface ReadState {
  // When the other side last read the caller's messages, or null if never.
  partnerLastReadAt: Date | null;
}

export interface GetClientReadStateUseCasePort {
  execute(clientId: string): Promise<ReadState>;
}
