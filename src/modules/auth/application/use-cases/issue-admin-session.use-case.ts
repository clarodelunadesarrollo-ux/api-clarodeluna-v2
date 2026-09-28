import { UnauthorizedException } from '@nestjs/common';

import { ADMIN_USER_EMAIL } from '../../domain/admin-user';
import { IssueAdminSessionPort } from '../ports/in/issue-admin-session.port';
import {
    TokenGeneratorPort,
    TokenPair,
} from '../ports/out/token-generator.port';
import { UserRepositoryPort } from '../ports/out/user-repository.port';

/**
 * Service-session auth for the admin panel (Option B): validates a shared
 * ADMIN_PANEL_KEY and, if it matches, issues the JWT pair for the seeded admin
 * user. A wrong key or a missing admin account surfaces as a generic 401 so the
 * client cannot tell the two apart.
 */
export class IssueAdminSessionUseCase implements IssueAdminSessionPort {
  constructor(
    private readonly adminPanelKey: string,
    private readonly users: UserRepositoryPort,
    private readonly tokens: TokenGeneratorPort,
  ) {}

  async execute(panelKey: string): Promise<TokenPair> {
    if (panelKey !== this.adminPanelKey) {
      throw new UnauthorizedException('Clave de panel inválida.');
    }

    const admin = await this.users.findByEmail(ADMIN_USER_EMAIL);
    if (admin === null) {
      throw new UnauthorizedException('Clave de panel inválida.');
    }

    return this.tokens.generate({ userId: admin.id, email: admin.email });
  }
}
