import { InvalidRefreshTokenException } from '../../domain/exceptions/invalid-refresh-token.exception';
import { TokenGeneratorPort } from '../ports/out/token-generator.port';
import { TokenVerifierPort } from '../ports/out/token-verifier.port';
import { UserRepositoryPort } from '../ports/out/user-repository.port';
import { RefreshTokensUseCase } from './refresh-tokens.use-case';

describe('RefreshTokensUseCase', () => {
  let verifier: { verifyRefreshToken: jest.Mock };
  let users: { findByEmail: jest.Mock; findOrCreateByEmail: jest.Mock };
  let tokens: { generate: jest.Mock };
  let useCase: RefreshTokensUseCase;

  const NEW_PAIR = { accessToken: 'new-access', refreshToken: 'new-refresh' };

  beforeEach(() => {
    verifier = { verifyRefreshToken: jest.fn() };
    users = { findByEmail: jest.fn(), findOrCreateByEmail: jest.fn() };
    tokens = { generate: jest.fn().mockResolvedValue(NEW_PAIR) };
    useCase = new RefreshTokensUseCase(
      verifier as unknown as TokenVerifierPort,
      users as unknown as UserRepositoryPort,
      tokens as unknown as TokenGeneratorPort,
    );
  });

  it('rotates the token pair for a valid refresh token', async () => {
    verifier.verifyRefreshToken.mockResolvedValue({
      userId: 'u1',
      email: 'ada@example.com',
    });
    users.findByEmail.mockResolvedValue({ id: 'u1', email: 'ada@example.com' });

    const result = await useCase.execute('valid.refresh.token');

    expect(result).toEqual(NEW_PAIR);
    expect(tokens.generate).toHaveBeenCalledWith({
      userId: 'u1',
      email: 'ada@example.com',
    });
  });

  it('rejects when the user no longer exists', async () => {
    verifier.verifyRefreshToken.mockResolvedValue({
      userId: 'u1',
      email: 'ada@example.com',
    });
    users.findByEmail.mockResolvedValue(null);

    await expect(useCase.execute('valid.refresh.token')).rejects.toBeInstanceOf(
      InvalidRefreshTokenException,
    );
    expect(tokens.generate).not.toHaveBeenCalled();
  });

  it('rejects when the token subject does not match the stored user', async () => {
    verifier.verifyRefreshToken.mockResolvedValue({
      userId: 'u1',
      email: 'ada@example.com',
    });
    users.findByEmail.mockResolvedValue({
      id: 'someone-else',
      email: 'ada@example.com',
    });

    await expect(useCase.execute('valid.refresh.token')).rejects.toBeInstanceOf(
      InvalidRefreshTokenException,
    );
    expect(tokens.generate).not.toHaveBeenCalled();
  });

  it('propagates the verifier failure for an invalid/expired token', async () => {
    verifier.verifyRefreshToken.mockRejectedValue(
      new InvalidRefreshTokenException(),
    );

    await expect(useCase.execute('bad.token')).rejects.toBeInstanceOf(
      InvalidRefreshTokenException,
    );
    expect(users.findByEmail).not.toHaveBeenCalled();
  });
});
