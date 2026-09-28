export const USER_LOOKUP = Symbol('USER_LOOKUP');

export interface UserProfile {
  id: string;
  name: string | null;
  email: string;
}

export interface UserLookupPort {
  findById(userId: string): Promise<UserProfile | null>;
}
