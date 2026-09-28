import { ResendCooldownException } from '../../domain/exceptions/resend-cooldown.exception';
import { Email } from '../../domain/value-objects/email.vo';
import { OtpPolicyConfig } from '../config/otp-policy.config';
import {
    RequestOtpResult,
    RequestOtpUseCasePort,
} from '../ports/in/request-otp.port';
import { ClockPort } from '../ports/out/clock.port';
import { OtpCodeRepositoryPort } from '../ports/out/otp-code-repository.port';
import { OtpGeneratorPort } from '../ports/out/otp-generator.port';
import { OtpHasherPort } from '../ports/out/otp-hasher.port';
import { UserRepositoryPort } from '../ports/out/user-repository.port';

/**
 * Orchestrates OTP issuance:
 * find-or-create user -> enforce resend cooldown -> invalidate previous ACTIVE
 * codes -> generate + hash a new code -> persist with expiry.
 *
 * The response shape is identical whether the user existed or not (anti-enumeration).
 */
export class RequestOtpUseCase implements RequestOtpUseCasePort {
  constructor(
    private readonly users: UserRepositoryPort,
    private readonly otpCodes: OtpCodeRepositoryPort,
    private readonly hasher: OtpHasherPort,
    private readonly generator: OtpGeneratorPort,
    private readonly clock: ClockPort,
    private readonly policy: OtpPolicyConfig,
  ) {}

  async execute(rawEmail: string): Promise<RequestOtpResult> {
    const email = Email.create(rawEmail);
    const user = await this.users.findOrCreateByEmail(email.value);
    const now = this.clock.now();
    const cooldownMs = this.policy.resendCooldownSeconds * 1000;

    const latest = await this.otpCodes.findLatestByUserId(user.id);
    if (latest) {
      const resendAvailableAt = latest.createdAt.getTime() + cooldownMs;
      if (now.getTime() < resendAvailableAt) {
        throw new ResendCooldownException();
      }
    }

    await this.otpCodes.invalidateActiveByUserId(user.id);

    const otp = this.generator.generate();
    const hashedCode = await this.hasher.hash(otp.value);
    const expiresAt = new Date(now.getTime() + this.policy.ttlSeconds * 1000);

    await this.otpCodes.create({
      userId: user.id,
      hashedCode,
      expiresAt,
      createdAt: now,
    });

    return {
      otp: otp.value,
      expiresAt,
      resendAvailableAt: new Date(now.getTime() + cooldownMs),
    };
  }
}
