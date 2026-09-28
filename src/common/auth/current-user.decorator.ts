import {
    createParamDecorator,
    ExecutionContext,
    UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';

export interface AuthenticatedUser {
  userId: string;
  email: string;
}

type RequestWithUser = Request & { user?: AuthenticatedUser };

/**
 * Extracts the authenticated user injected by the global JwtAuthGuard.
 * Throws if used on a route that was not protected (defensive).
 */
export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): AuthenticatedUser => {
    const request = ctx.switchToHttp().getRequest<RequestWithUser>();
    if (!request.user) {
      throw new UnauthorizedException('No autorizado.');
    }
    return request.user;
  },
);
