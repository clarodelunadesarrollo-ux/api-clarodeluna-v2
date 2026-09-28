import { ListClientsUseCasePort } from '../ports/in/list-clients.port';
import {
    ClientRepositoryPort,
    ClientView,
} from '../ports/out/client-repository.port';

/** Lists every client (role CLIENT) for the admin users table. */
export class ListClientsUseCase implements ListClientsUseCasePort {
  constructor(private readonly clients: ClientRepositoryPort) {}

  execute(): Promise<ClientView[]> {
    return this.clients.findAllClients();
  }
}
