export const PROFILE_REPOSITORY = Symbol('PROFILE_REPOSITORY');

export interface ProfileView {
  userId: string;
  name: string | null;
  email: string;
}

export interface ProfileRepositoryPort {
  findByUserId(userId: string): Promise<ProfileView | null>;
  updateName(userId: string, name: string | null): Promise<ProfileView>;
}
