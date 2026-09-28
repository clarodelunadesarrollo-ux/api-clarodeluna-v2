import { ReadState } from './get-client-read-state.port';

export const GET_CONVERSATION_READ_STATE_USE_CASE = Symbol(
  'GET_CONVERSATION_READ_STATE_USE_CASE',
);

export interface GetConversationReadStateUseCasePort {
  execute(conversationId: string): Promise<ReadState>;
}
