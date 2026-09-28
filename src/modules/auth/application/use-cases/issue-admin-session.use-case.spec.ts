import { UnauthorizedException } from '@nestjs/common';

import { ADMIN_USER_EMAIL } from '../../domain/admin-user';
import { User } from '../../domain/entities/user.entity';
import {
    TokenGeneratorPort,
    TokenPair,
} from '../ports/out/token-generator.port';
import { UserRepositoryPort } from '../ports/out/user-repository.port';
import { IssueAdminSessionUseCase } from './issue-admin-session.use-case';

const PANEL_KEY = 'a-very-long-admin-panel-key-32-chars-min';

interface FakeUserRepository extends UserRepositoryPort {
  findByEmail: jest.Mock<Promise<User | null>, [string]>;
  findOrCreateByEmail: jest.Mock<Promise<User>, [string]>;
}

interface FakeTokenGenerator extends TokenGeneratorPort {
  generate: jest.Mock<Promise<TokenPair>, [{ userId: string; email: string }]>;
}

function buildAdminUser(): User {
  return User.rehydrate({
    id: 'admin-id',
    email: ADMIN_USER_EMAIL,
    createdAt: new Date('2024-01-01T00:00:00.000Z'),
    updatedAt: new Date('2024-01-01T00:00:00.000Z'),
  });
}

describe('IssueAdminSessionUseCase', () => {
  let users: FakeUserRepository;
  let tokens: FakeTokenGenerator;
  let useCase: IssueAdminSessionUseCase;

  beforeEach(() => {
    users = {
      findByEmail: jest.fn(),
      findOrCreateByEmail: jest.fn(),
    };
    tokens = { generate: jest.fn() };
    useCase = new IssueAdminSessionUseCase(PANEL_KEY, users, tokens);
  });

  it('issues the admin token pair when the panel key matches', async () => {
    users.findByEmail.mockResolvedValue(buildAdminUser());
    const pair: TokenPair = {
      accessToken: 'access',
      refreshToken: 'refresh',
    };
    tokens.generate.mockResolvedValue(pair);

    const result = await useCase.execute(PANEL_KEY);

    expect(result).toBe(pair);
    expect(users.findByEmail).toHaveBeenCalledWith(ADMIN_USER_EMAIL);
    expect(tokens.generate).toHaveBeenCalledWith({
      userId: 'admin-id',
      email: ADMIN_USER_EMAIL,
    });
  });

  it('throws unauthorized when the panel key is invalid (401)', async () => {
    await expect(useCase.execute('wrong-key')).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
    expect(users.findByEmail).not.toHaveBeenCalled();
    expect(tokens.generate).not.toHaveBeenCalled();
  });

  it('throws unauthorized when the admin user is missing (401)', async () => {
    users.findByEmail.mockResolvedValue(null);

    await expect(useCase.execute(PANEL_KEY)).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
    expect(tokens.generate).not.toHaveBeenCalled();
  });
});
