import { ClientView } from '../../application/ports/out/client-repository.port';

/** Serialized client row returned by the admin users endpoints. */
export class ClientResponseDto {
  readonly id: string;
  readonly name: string | null;
  readonly email: string;
  readonly createdAt: string;

  constructor(view: ClientView) {
    this.id = view.id;
    this.name = view.name;
    this.email = view.email;
    this.createdAt = view.createdAt.toISOString();
  }
}
