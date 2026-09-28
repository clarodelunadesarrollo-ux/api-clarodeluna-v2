import { Inject, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import {
    TokenVerifierPort,
    VerifiedToken,
} from '../../application/ports/out/token-verifier.port';
import { InvalidRefreshTokenException } from '../../domain/exceptions/invalid-refresh-token.exception';

export const JWT_VERIFIER_CONFIG = Symbol('JWT_VERIFIER_CONFIG');

export interface JwtVerifierConfig {
  refreshSecret: string;
}

interface RefreshTokenPayload {
  sub: string;
  email: string;
}

/**
 * Verifies the HS256 refresh token against JWT_REFRESH_SECRET. Any failure
 * (bad signature, expired, malformed) is translated to the domain-level
 * InvalidRefreshTokenException.
 */
@Injectable()
export class JwtTokenVerifier implements TokenVerifierPort {
  constructor(
    private readonly jwt: JwtService,
    @Inject(JWT_VERIFIER_CONFIG)
    private readonly config: JwtVerifierConfig,
  ) {}

  async verifyRefreshToken(token: string): Promise<VerifiedToken> {
    try {
      const payload = await this.jwt.verifyAsync<RefreshTokenPayload>(token, {
        secret: this.config.refreshSecret,
        algorithms: ['HS256'],
      });
      return { userId: payload.sub, email: payload.email };
    } catch {
      throw new InvalidRefreshTokenException();
    }
  }
}
