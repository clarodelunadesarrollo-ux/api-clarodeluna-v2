import { ProfileView } from '../out/profile-repository.port';

export const UPDATE_PROFILE_USE_CASE = Symbol('UPDATE_PROFILE_USE_CASE');

export interface UpdateProfileUseCasePort {
  execute(userId: string, name: string | null): Promise<ProfileView>;
}
