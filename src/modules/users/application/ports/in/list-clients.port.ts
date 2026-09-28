import { ClientView } from '../out/client-repository.port';

export const LIST_CLIENTS_USE_CASE = Symbol('LIST_CLIENTS_USE_CASE');

export interface ListClientsUseCasePort {
  execute(): Promise<ClientView[]>;
}
