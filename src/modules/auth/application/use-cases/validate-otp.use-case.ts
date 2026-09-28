import { InvalidOtpException } from '../../domain/exceptions/invalid-otp.exception';
import { OtpAttemptsExhaustedException } from '../../domain/exceptions/otp-attempts-exhausted.exception';
import { OtpExpiredException } from '../../domain/exceptions/otp-expired.exception';
import { Email } from '../../domain/value-objects/email.vo';
import { OtpPolicyConfig } from '../config/otp-policy.config';
import { ValidateOtpUseCasePort } from '../ports/in/validate-otp.port';
import { ClockPort } from '../ports/out/clock.port';
import { OtpCodeRepositoryPort } from '../ports/out/otp-code-repository.port';
import { OtpHasherPort } from '../ports/out/otp-hasher.port';
import {
    TokenGeneratorPort,
    TokenPair,
} from '../ports/out/token-generator.port';
import { UserRepositoryPort } from '../ports/out/user-repository.port';

/**
 * Orchestrates OTP validation:
 * load latest ACTIVE code -> check expiry -> compare hash / count attempts ->
 * on success mark consumed and issue the JWT pair.
 *
 * A missing user or missing ACTIVE code surfaces as InvalidOtpException (401),
 * so the client cannot distinguish "no code for this email" from "wrong code".
 */
export class ValidateOtpUseCase implements ValidateOtpUseCasePort {
  constructor(
    private readonly users: UserRepositoryPort,
    private readonly otpCodes: OtpCodeRepositoryPort,
    private readonly hasher: OtpHasherPort,
    private readonly tokens: TokenGeneratorPort,
    private readonly clock: ClockPort,
    private readonly policy: OtpPolicyConfig,
  ) {}

  async execute(rawEmail: string, rawOtp: string): Promise<TokenPair> {
    const email = Email.create(rawEmail);

    const user = await this.users.findByEmail(email.value);
    if (!user) {
      throw new InvalidOtpException('No user found for the provided email');
    }

    const otpCode = await this.otpCodes.findLatestActiveByUserId(user.id);
    if (!otpCode) {
      throw new InvalidOtpException('No active OTP found for the user');
    }

    const now = this.clock.now();

    if (otpCode.isExpired(now)) {
      otpCode.markExpired();
      await this.otpCodes.save(otpCode);
      throw new OtpExpiredException();
    }

    const matches = await this.hasher.verify(rawOtp, otpCode.hashedCode);
    if (!matches) {
      otpCode.registerFailedAttempt();
      if (otpCode.hasReachedMaxAttempts(this.policy.maxAttempts)) {
        otpCode.markInvalidated();
        await this.otpCodes.save(otpCode);
        throw new OtpAttemptsExhaustedException();
      }
      await this.otpCodes.save(otpCode);
      throw new InvalidOtpException();
    }

    otpCode.markConsumed(now);
    await this.otpCodes.save(otpCode);

    return this.tokens.generate({ userId: user.id, email: user.email });
  }
}
