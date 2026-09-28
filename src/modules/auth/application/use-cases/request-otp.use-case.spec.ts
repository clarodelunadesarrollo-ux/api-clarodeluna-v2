import { ResendCooldownException } from '../../domain/exceptions/resend-cooldown.exception';
import { OtpPolicyConfig } from '../config/otp-policy.config';
import { ClockPort } from '../ports/out/clock.port';
import { OtpCodeRepositoryPort } from '../ports/out/otp-code-repository.port';
import { OtpGeneratorPort } from '../ports/out/otp-generator.port';
import { OtpHasherPort } from '../ports/out/otp-hasher.port';
import { UserRepositoryPort } from '../ports/out/user-repository.port';
import { RequestOtpUseCase } from './request-otp.use-case';

describe('RequestOtpUseCase', () => {
  let users: { findByEmail: jest.Mock; findOrCreateByEmail: jest.Mock };
  let otpCodes: {
    findLatestByUserId: jest.Mock;
    findLatestActiveByUserId: jest.Mock;
    invalidateActiveByUserId: jest.Mock;
    create: jest.Mock;
    save: jest.Mock;
  };
  let hasher: { hash: jest.Mock; verify: jest.Mock };
  let generator: { generate: jest.Mock };
  let clock: { now: jest.Mock };
  let policy: OtpPolicyConfig;
  let useCase: RequestOtpUseCase;

  const NOW = new Date('2026-09-26T12:00:00.000Z');
  const USER = { id: 'u1', email: 'ada@example.com' };

  beforeEach(() => {
    users = {
      findByEmail: jest.fn(),
      findOrCreateByEmail: jest.fn().mockResolvedValue(USER),
    };
    otpCodes = {
      findLatestByUserId: jest.fn().mockResolvedValue(null),
      findLatestActiveByUserId: jest.fn(),
      invalidateActiveByUserId: jest.fn().mockResolvedValue(undefined),
      create: jest.fn().mockResolvedValue(undefined),
      save: jest.fn(),
    };
    hasher = { hash: jest.fn().mockResolvedValue('hashed-code'), verify: jest.fn() };
    generator = { generate: jest.fn().mockReturnValue({ value: '123456' }) };
    clock = { now: jest.fn().mockReturnValue(NOW) };
    policy = { ttlSeconds: 300, maxAttempts: 3, resendCooldownSeconds: 60 };
    useCase = new RequestOtpUseCase(
      users as unknown as UserRepositoryPort,
      otpCodes as unknown as OtpCodeRepositoryPort,
      hasher as unknown as OtpHasherPort,
      generator as unknown as OtpGeneratorPort,
      clock as unknown as ClockPort,
      policy,
    );
  });

  it('issues a new code for a user without a previous code', async () => {
    const result = await useCase.execute('  Ada@Example.com ');

    expect(users.findOrCreateByEmail).toHaveBeenCalledWith('ada@example.com');
    expect(otpCodes.invalidateActiveByUserId).toHaveBeenCalledWith('u1');
    expect(otpCodes.create).toHaveBeenCalledWith({
      userId: 'u1',
      hashedCode: 'hashed-code',
      expiresAt: new Date(NOW.getTime() + 300 * 1000),
      createdAt: NOW,
    });
    expect(result).toEqual({
      otp: '123456',
      expiresAt: new Date(NOW.getTime() + 300 * 1000),
      resendAvailableAt: new Date(NOW.getTime() + 60 * 1000),
    });
  });

  it('enforces the resend cooldown when a recent code exists', async () => {
    otpCodes.findLatestByUserId.mockResolvedValue({
      createdAt: new Date(NOW.getTime() - 30 * 1000),
    });

    await expect(useCase.execute('ada@example.com')).rejects.toBeInstanceOf(
      ResendCooldownException,
    );
    expect(otpCodes.invalidateActiveByUserId).not.toHaveBeenCalled();
    expect(otpCodes.create).not.toHaveBeenCalled();
  });

  it('allows a resend once the cooldown has elapsed', async () => {
    otpCodes.findLatestByUserId.mockResolvedValue({
      createdAt: new Date(NOW.getTime() - 90 * 1000),
    });

    const result = await useCase.execute('ada@example.com');

    expect(otpCodes.create).toHaveBeenCalledTimes(1);
    expect(result.otp).toBe('123456');
  });

  it('invalidates previous active codes before creating a new one', async () => {
    await useCase.execute('ada@example.com');

    const invalidateOrder =
      otpCodes.invalidateActiveByUserId.mock.invocationCallOrder[0];
    const createOrder = otpCodes.create.mock.invocationCallOrder[0];
    expect(invalidateOrder).toBeLessThan(createOrder);
  });
});
