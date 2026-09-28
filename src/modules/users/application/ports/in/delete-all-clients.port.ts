export const DELETE_ALL_CLIENTS_USE_CASE = Symbol('DELETE_ALL_CLIENTS_USE_CASE');

export interface DeleteAllClientsUseCasePort {
  /** Deletes every client and returns how many were removed. */
  execute(): Promise<number>;
}
