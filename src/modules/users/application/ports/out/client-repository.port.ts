export const CLIENT_REPOSITORY = Symbol('CLIENT_REPOSITORY');

/** Read model for a client user shown in the admin users table. */
export interface ClientView {
  id: string;
  name: string | null;
  email: string;
  createdAt: Date;
}

/**
 * Outbound port for admin client management. Only operates on users with the
 * CLIENT role; admins are never listed or removed through this port.
 */
export interface ClientRepositoryPort {
  findAllClients(): Promise<ClientView[]>;
  deleteClient(id: string): Promise<void>;
  deleteAllClients(): Promise<number>;
}
