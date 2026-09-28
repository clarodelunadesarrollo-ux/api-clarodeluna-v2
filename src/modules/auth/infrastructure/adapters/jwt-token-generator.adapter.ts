import { Inject, Injectable } from '@nestjs/common';
import { JwtService, JwtSignOptions } from '@nestjs/jwt';

import {
    TokenGeneratorPort,
    TokenPair,
    TokenPayload,
} from '../../application/ports/out/token-generator.port';

export const JWT_GENERATOR_CONFIG = Symbol('JWT_GENERATOR_CONFIG');

export interface JwtGeneratorConfig {
  accessSecret: string;
  refreshSecret: string;
  accessTtl: string;
  refreshTtl: string;
}

/**
 * Issues a stateless HS256 access/refresh JWT pair. Secrets and TTLs are
 * injected from validated environment config; the refresh token is NOT
 * persisted (stateless refresh for this phase).
 */
@Injectable()
export class JwtTokenGenerator implements TokenGeneratorPort {
  constructor(
    private readonly jwt: JwtService,
    @Inject(JWT_GENERATOR_CONFIG)
    private readonly config: JwtGeneratorConfig,
  ) {}

  async generate(payload: TokenPayload): Promise<TokenPair> {
    const claims = { sub: payload.userId, email: payload.email };

    const accessToken = await this.jwt.signAsync(claims, {
      secret: this.config.accessSecret,
      expiresIn: this.config.accessTtl as JwtSignOptions['expiresIn'],
      algorithm: 'HS256',
    });

    const refreshToken = await this.jwt.signAsync(claims, {
      secret: this.config.refreshSecret,
      expiresIn: this.config.refreshTtl as JwtSignOptions['expiresIn'],
      algorithm: 'HS256',
    });

    return { accessToken, refreshToken };
  }
}
