import { User } from '../../../domain/entities/user.entity';

export const USER_REPOSITORY = Symbol('USER_REPOSITORY');

export interface UserRepositoryPort {
  findByEmail(email: string): Promise<User | null>;
  /** Implicit registration: returns the existing user or creates one on the fly (upsert by email). */
  findOrCreateByEmail(email: string): Promise<User>;
}
