import {
    CanActivate,
    ExecutionContext,
    Inject,
    Injectable,
    UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';

import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { AuthenticatedUser } from './current-user.decorator';

export const JWT_AUTH_CONFIG = Symbol('JWT_AUTH_CONFIG');

export interface JwtAuthConfig {
  accessSecret: string;
}

interface AccessTokenPayload {
  sub: string;
  email: string;
}

type RequestWithUser = Request & { user?: AuthenticatedUser };

/**
 * Deny-by-default global guard. Lets @Public() routes through, otherwise
 * verifies the Bearer access token (HS256, JWT_ACCESS_SECRET) and injects
 * { userId, email } into request.user for @CurrentUser().
 */
@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly jwt: JwtService,
    @Inject(JWT_AUTH_CONFIG) private readonly config: JwtAuthConfig,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest<RequestWithUser>();
    const token = this.extractBearerToken(request);
    if (!token) {
      throw new UnauthorizedException('No autorizado.');
    }

    try {
      const payload = await this.jwt.verifyAsync<AccessTokenPayload>(token, {
        secret: this.config.accessSecret,
        algorithms: ['HS256'],
      });
      request.user = { userId: payload.sub, email: payload.email };
      return true;
    } catch {
      throw new UnauthorizedException('No autorizado.');
    }
  }

  private extractBearerToken(request: Request): string | null {
    const header = request.headers.authorization;
    if (!header) {
      return null;
    }
    const [scheme, value] = header.split(' ');
    if (scheme !== 'Bearer' || !value) {
      return null;
    }
    return value;
  }
}
