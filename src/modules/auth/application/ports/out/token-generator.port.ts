export const TOKEN_GENERATOR = Symbol('TOKEN_GENERATOR');

export interface TokenPayload {
  userId: string;
  email: string;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

export interface TokenGeneratorPort {
  generate(payload: TokenPayload): Promise<TokenPair>;
}
