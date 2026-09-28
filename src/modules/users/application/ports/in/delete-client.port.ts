export const DELETE_CLIENT_USE_CASE = Symbol('DELETE_CLIENT_USE_CASE');

export interface DeleteClientUseCasePort {
  execute(id: string): Promise<void>;
}
