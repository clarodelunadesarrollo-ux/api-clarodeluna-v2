import { SetMetadata } from '@nestjs/common';

import { UserRole } from '../auth/user-role.enum';

export const ROLES_KEY = 'roles';

/**
 * Restricts a route/controller to the given roles. Enforced by RolesGuard,
 * which must run after the global JwtAuthGuard (so request.user is set).
 */
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);
