import { DeleteClientUseCasePort } from '../ports/in/delete-client.port';
import { ClientRepositoryPort } from '../ports/out/client-repository.port';

/** Removes a single client. Unknown ids are rejected by the repository (404). */
export class DeleteClientUseCase implements DeleteClientUseCasePort {
  constructor(private readonly clients: ClientRepositoryPort) {}

  execute(id: string): Promise<void> {
    return this.clients.deleteClient(id);
  }
}
