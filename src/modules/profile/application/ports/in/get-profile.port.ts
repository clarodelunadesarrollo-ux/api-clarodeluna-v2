import { ProfileView } from '../out/profile-repository.port';

export const GET_PROFILE_USE_CASE = Symbol('GET_PROFILE_USE_CASE');

export interface GetProfileUseCasePort {
  execute(userId: string): Promise<ProfileView>;
}
