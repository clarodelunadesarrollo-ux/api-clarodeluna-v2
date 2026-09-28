import { OtpCode } from '../../domain/entities/otp-code.entity';
import { InvalidOtpException } from '../../domain/exceptions/invalid-otp.exception';
import { OtpAttemptsExhaustedException } from '../../domain/exceptions/otp-attempts-exhausted.exception';
import { OtpExpiredException } from '../../domain/exceptions/otp-expired.exception';
import { OtpPolicyConfig } from '../config/otp-policy.config';
import { ClockPort } from '../ports/out/clock.port';
import { OtpCodeRepositoryPort } from '../ports/out/otp-code-repository.port';
import { OtpHasherPort } from '../ports/out/otp-hasher.port';
import { TokenGeneratorPort } from '../ports/out/token-generator.port';
import { UserRepositoryPort } from '../ports/out/user-repository.port';
import { ValidateOtpUseCase } from './validate-otp.use-case';

interface FakeOtpCode {
  hashedCode: string;
  isExpired: jest.Mock;
  markExpired: jest.Mock;
  registerFailedAttempt: jest.Mock;
  hasReachedMaxAttempts: jest.Mock;
  markInvalidated: jest.Mock;
  markConsumed: jest.Mock;
}

function buildOtpCode(overrides: Partial<FakeOtpCode> = {}): FakeOtpCode {
  return {
    hashedCode: 'hashed-code',
    isExpired: jest.fn().mockReturnValue(false),
    markExpired: jest.fn(),
    registerFailedAttempt: jest.fn(),
    hasReachedMaxAttempts: jest.fn().mockReturnValue(false),
    markInvalidated: jest.fn(),
    markConsumed: jest.fn(),
    ...overrides,
  };
}

describe('ValidateOtpUseCase', () => {
  let users: { findByEmail: jest.Mock; findOrCreateByEmail: jest.Mock };
  let otpCodes: {
    findLatestActiveByUserId: jest.Mock;
    save: jest.Mock;
  };
  let hasher: { hash: jest.Mock; verify: jest.Mock };
  let tokens: { generate: jest.Mock };
  let clock: { now: jest.Mock };
  let policy: OtpPolicyConfig;
  let useCase: ValidateOtpUseCase;

  const NOW = new Date('2026-09-26T12:00:00.000Z');
  const USER = { id: 'u1', email: 'ada@example.com' };
  const PAIR = { accessToken: 'access', refreshToken: 'refresh' };

  beforeEach(() => {
    users = {
      findByEmail: jest.fn().mockResolvedValue(USER),
      findOrCreateByEmail: jest.fn(),
    };
    otpCodes = {
      findLatestActiveByUserId: jest.fn(),
      save: jest.fn().mockResolvedValue(undefined),
    };
    hasher = { hash: jest.fn(), verify: jest.fn().mockResolvedValue(true) };
    tokens = { generate: jest.fn().mockResolvedValue(PAIR) };
    clock = { now: jest.fn().mockReturnValue(NOW) };
    policy = { ttlSeconds: 300, maxAttempts: 3, resendCooldownSeconds: 60 };
    useCase = new ValidateOtpUseCase(
      users as unknown as UserRepositoryPort,
      otpCodes as unknown as OtpCodeRepositoryPort,
      hasher as unknown as OtpHasherPort,
      tokens as unknown as TokenGeneratorPort,
      clock as unknown as ClockPort,
      policy,
    );
  });

  it('issues a token pair for a valid code', async () => {
    const otpCode = buildOtpCode();
    otpCodes.findLatestActiveByUserId.mockResolvedValue(otpCode);

    const result = await useCase.execute('ada@example.com', '123456');

    expect(result).toEqual(PAIR);
    expect(otpCode.markConsumed).toHaveBeenCalledWith(NOW);
    expect(otpCodes.save).toHaveBeenCalledWith(otpCode as unknown as OtpCode);
    expect(tokens.generate).toHaveBeenCalledWith({
      userId: 'u1',
      email: 'ada@example.com',
    });
  });

  it('rejects when the user does not exist', async () => {
    users.findByEmail.mockResolvedValue(null);

    await expect(
      useCase.execute('ghost@example.com', '123456'),
    ).rejects.toBeInstanceOf(InvalidOtpException);
    expect(tokens.generate).not.toHaveBeenCalled();
  });

  it('rejects when there is no active code', async () => {
    otpCodes.findLatestActiveByUserId.mockResolvedValue(null);

    await expect(
      useCase.execute('ada@example.com', '123456'),
    ).rejects.toBeInstanceOf(InvalidOtpException);
    expect(tokens.generate).not.toHaveBeenCalled();
  });

  it('marks the code expired and rejects when it is expired', async () => {
    const otpCode = buildOtpCode({ isExpired: jest.fn().mockReturnValue(true) });
    otpCodes.findLatestActiveByUserId.mockResolvedValue(otpCode);

    await expect(
      useCase.execute('ada@example.com', '123456'),
    ).rejects.toBeInstanceOf(OtpExpiredException);
    expect(otpCode.markExpired).toHaveBeenCalledTimes(1);
    expect(otpCodes.save).toHaveBeenCalledWith(otpCode as unknown as OtpCode);
    expect(tokens.generate).not.toHaveBeenCalled();
  });

  it('registers a failed attempt and rejects on a wrong code with attempts left', async () => {
    const otpCode = buildOtpCode();
    otpCodes.findLatestActiveByUserId.mockResolvedValue(otpCode);
    hasher.verify.mockResolvedValue(false);

    await expect(
      useCase.execute('ada@example.com', '000000'),
    ).rejects.toBeInstanceOf(InvalidOtpException);
    expect(otpCode.registerFailedAttempt).toHaveBeenCalledTimes(1);
    expect(otpCode.markInvalidated).not.toHaveBeenCalled();
    expect(tokens.generate).not.toHaveBeenCalled();
  });

  it('invalidates the code and rejects once attempts are exhausted', async () => {
    const otpCode = buildOtpCode({
      hasReachedMaxAttempts: jest.fn().mockReturnValue(true),
    });
    otpCodes.findLatestActiveByUserId.mockResolvedValue(otpCode);
    hasher.verify.mockResolvedValue(false);

    await expect(
      useCase.execute('ada@example.com', '000000'),
    ).rejects.toBeInstanceOf(OtpAttemptsExhaustedException);
    expect(otpCode.markInvalidated).toHaveBeenCalledTimes(1);
    expect(tokens.generate).not.toHaveBeenCalled();
  });
});
