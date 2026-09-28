import {
    CanActivate,
    ExecutionContext,
    ForbiddenException,
    Injectable,
    UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';

import { PrismaService } from '../../prisma/prisma.service';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { AuthenticatedUser } from './current-user.decorator';
import { UserRole } from './user-role.enum';

type RequestWithUser = Request & { user?: AuthenticatedUser };

/**
 * Role-based authorization guard. Runs after the global JwtAuthGuard, so
 * request.user is already populated. Routes without @Roles() are allowed.
 * The user's role is resolved from the database by userId (kept out of the JWT
 * to avoid touching the auth/token layer); admin traffic is low-volume so the
 * extra lookup is negligible.
 */
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest<RequestWithUser>();
    if (!request.user) {
      throw new UnauthorizedException('No autorizado.');
    }

    const account = await this.prisma.user.findUnique({
      where: { id: request.user.userId },
      select: { role: true },
    });
    if (!account || !requiredRoles.includes(account.role as UserRole)) {
      throw new ForbiddenException('No tenés permisos para esta acción.');
    }

    return true;
  }
}
