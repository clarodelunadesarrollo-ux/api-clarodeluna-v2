export const TOKEN_VERIFIER = Symbol('TOKEN_VERIFIER');

export interface VerifiedToken {
  userId: string;
  email: string;
}

export interface TokenVerifierPort {
  verifyRefreshToken(token: string): Promise<VerifiedToken>;
}
