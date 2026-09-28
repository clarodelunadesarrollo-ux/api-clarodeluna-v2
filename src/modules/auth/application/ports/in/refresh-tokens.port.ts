import { TokenPair } from '../out/token-generator.port';

export const REFRESH_TOKENS_USE_CASE = Symbol('REFRESH_TOKENS_USE_CASE');

export interface RefreshTokensUseCasePort {
  execute(refreshToken: string): Promise<TokenPair>;
}
