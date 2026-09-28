import { InvalidRefreshTokenException } from '../../domain/exceptions/invalid-refresh-token.exception';
import { RefreshTokensUseCasePort } from '../ports/in/refresh-tokens.port';
import {
    TokenGeneratorPort,
    TokenPair,
} from '../ports/out/token-generator.port';
import { TokenVerifierPort } from '../ports/out/token-verifier.port';
import { UserRepositoryPort } from '../ports/out/user-repository.port';

/**
 * Verifies a stateless refresh token, confirms the user still exists and issues
 * a brand-new token pair (rotation). Any verification or ownership failure is a
 * terminal InvalidRefreshTokenException (401) that forces a re-login.
 */
export class RefreshTokensUseCase implements RefreshTokensUseCasePort {
  constructor(
    private readonly verifier: TokenVerifierPort,
    private readonly users: UserRepositoryPort,
    private readonly tokens: TokenGeneratorPort,
  ) {}

  async execute(refreshToken: string): Promise<TokenPair> {
    const verified = await this.verifier.verifyRefreshToken(refreshToken);
    const user = await this.users.findByEmail(verified.email);
    if (!user || user.id !== verified.userId) {
      throw new InvalidRefreshTokenException();
    }
    return this.tokens.generate({ userId: user.id, email: user.email });
  }
}
