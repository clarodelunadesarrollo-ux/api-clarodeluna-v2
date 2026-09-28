import { DeleteAllClientsUseCasePort } from '../ports/in/delete-all-clients.port';
import { ClientRepositoryPort } from '../ports/out/client-repository.port';

/** Removes every client at once and reports how many were deleted. */
export class DeleteAllClientsUseCase implements DeleteAllClientsUseCasePort {
  constructor(private readonly clients: ClientRepositoryPort) {}

  execute(): Promise<number> {
    return this.clients.deleteAllClients();
  }
}
