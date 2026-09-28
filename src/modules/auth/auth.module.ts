import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';

import { ADMIN_PANEL_KEY } from './application/config/admin-panel.config';
import {
    OTP_POLICY_CONFIG,
    OtpPolicyConfig,
} from './application/config/otp-policy.config';
import { ISSUE_ADMIN_SESSION_USE_CASE } from './application/ports/in/issue-admin-session.port';
import { REFRESH_TOKENS_USE_CASE } from './application/ports/in/refresh-tokens.port';
import { REQUEST_OTP_USE_CASE } from './application/ports/in/request-otp.port';
import { VALIDATE_OTP_USE_CASE } from './application/ports/in/validate-otp.port';
import { CLOCK, ClockPort } from './application/ports/out/clock.port';
import {
    OTP_CODE_REPOSITORY,
    OtpCodeRepositoryPort,
} from './application/ports/out/otp-code-repository.port';
import {
    OTP_GENERATOR,
    OtpGeneratorPort,
} from './application/ports/out/otp-generator.port';
import {
    OTP_HASHER,
    OtpHasherPort,
} from './application/ports/out/otp-hasher.port';
import {
    TOKEN_GENERATOR,
    TokenGeneratorPort,
} from './application/ports/out/token-generator.port';
import {
    TOKEN_VERIFIER,
    TokenVerifierPort,
} from './application/ports/out/token-verifier.port';
import {
    USER_REPOSITORY,
    UserRepositoryPort,
} from './application/ports/out/user-repository.port';
import { IssueAdminSessionUseCase } from './application/use-cases/issue-admin-session.use-case';
import { RefreshTokensUseCase } from './application/use-cases/refresh-tokens.use-case';
import { RequestOtpUseCase } from './application/use-cases/request-otp.use-case';
import { ValidateOtpUseCase } from './application/use-cases/validate-otp.use-case';
import { BcryptOtpHasher } from './infrastructure/adapters/bcrypt-otp-hasher.adapter';
import { CryptoOtpGenerator } from './infrastructure/adapters/crypto-otp-generator.adapter';
import {
    JWT_GENERATOR_CONFIG,
    JwtGeneratorConfig,
    JwtTokenGenerator,
} from './infrastructure/adapters/jwt-token-generator.adapter';
import {
    JWT_VERIFIER_CONFIG,
    JwtTokenVerifier,
    JwtVerifierConfig,
} from './infrastructure/adapters/jwt-token-verifier.adapter';
import { SystemClock } from './infrastructure/adapters/system-clock.adapter';
import { OtpCodePrismaRepository } from './infrastructure/persistence/repositories/otp-code-prisma.repository';
import { UserPrismaRepository } from './infrastructure/persistence/repositories/user-prisma.repository';
import { AdminSessionController } from './presentation/controllers/admin-session.controller';
import { AuthController } from './presentation/controllers/auth.controller';

@Module({
  imports: [JwtModule.register({})],
  controllers: [AuthController, AdminSessionController],
  providers: [
    // Outbound port adapters
    { provide: USER_REPOSITORY, useClass: UserPrismaRepository },
    { provide: OTP_CODE_REPOSITORY, useClass: OtpCodePrismaRepository },
    { provide: OTP_HASHER, useClass: BcryptOtpHasher },
    { provide: OTP_GENERATOR, useClass: CryptoOtpGenerator },
    { provide: CLOCK, useClass: SystemClock },
    { provide: TOKEN_GENERATOR, useClass: JwtTokenGenerator },
    { provide: TOKEN_VERIFIER, useClass: JwtTokenVerifier },

    // Config providers derived from validated environment
    {
      provide: JWT_GENERATOR_CONFIG,
      useFactory: (config: ConfigService): JwtGeneratorConfig => ({
        accessSecret: config.getOrThrow<string>('JWT_ACCESS_SECRET'),
        refreshSecret: config.getOrThrow<string>('JWT_REFRESH_SECRET'),
        accessTtl: config.get<string>('JWT_ACCESS_TTL', '15m'),
        refreshTtl: config.get<string>('JWT_REFRESH_TTL', '7d'),
      }),
      inject: [ConfigService],
    },
    {
      provide: JWT_VERIFIER_CONFIG,
      useFactory: (config: ConfigService): JwtVerifierConfig => ({
        refreshSecret: config.getOrThrow<string>('JWT_REFRESH_SECRET'),
      }),
      inject: [ConfigService],
    },
    {
      provide: OTP_POLICY_CONFIG,
      useFactory: (config: ConfigService): OtpPolicyConfig => ({
        ttlSeconds: Number(config.get<string>('OTP_TTL_SECONDS', '300')),
        maxAttempts: Number(config.get<string>('OTP_MAX_ATTEMPTS', '3')),
        resendCooldownSeconds: Number(
          config.get<string>('OTP_RESEND_COOLDOWN_SECONDS', '60'),
        ),
      }),
      inject: [ConfigService],
    },
    {
      provide: ADMIN_PANEL_KEY,
      useFactory: (config: ConfigService): string =>
        config.getOrThrow<string>('ADMIN_PANEL_KEY'),
      inject: [ConfigService],
    },

    // Use cases (pure classes) wired via factories injecting port interfaces
    {
      provide: REQUEST_OTP_USE_CASE,
      useFactory: (
        users: UserRepositoryPort,
        otpCodes: OtpCodeRepositoryPort,
        hasher: OtpHasherPort,
        generator: OtpGeneratorPort,
        clock: ClockPort,
        policy: OtpPolicyConfig,
      ): RequestOtpUseCase =>
        new RequestOtpUseCase(users, otpCodes, hasher, generator, clock, policy),
      inject: [
        USER_REPOSITORY,
        OTP_CODE_REPOSITORY,
        OTP_HASHER,
        OTP_GENERATOR,
        CLOCK,
        OTP_POLICY_CONFIG,
      ],
    },
    {
      provide: VALIDATE_OTP_USE_CASE,
      useFactory: (
        users: UserRepositoryPort,
        otpCodes: OtpCodeRepositoryPort,
        hasher: OtpHasherPort,
        tokens: TokenGeneratorPort,
        clock: ClockPort,
        policy: OtpPolicyConfig,
      ): ValidateOtpUseCase =>
        new ValidateOtpUseCase(users, otpCodes, hasher, tokens, clock, policy),
      inject: [
        USER_REPOSITORY,
        OTP_CODE_REPOSITORY,
        OTP_HASHER,
        TOKEN_GENERATOR,
        CLOCK,
        OTP_POLICY_CONFIG,
      ],
    },
    {
      provide: REFRESH_TOKENS_USE_CASE,
      useFactory: (
        verifier: TokenVerifierPort,
        users: UserRepositoryPort,
        tokens: TokenGeneratorPort,
      ): RefreshTokensUseCase =>
        new RefreshTokensUseCase(verifier, users, tokens),
      inject: [TOKEN_VERIFIER, USER_REPOSITORY, TOKEN_GENERATOR],
    },
    {
      provide: ISSUE_ADMIN_SESSION_USE_CASE,
      useFactory: (
        adminPanelKey: string,
        users: UserRepositoryPort,
        tokens: TokenGeneratorPort,
      ): IssueAdminSessionUseCase =>
        new IssueAdminSessionUseCase(adminPanelKey, users, tokens),
      inject: [ADMIN_PANEL_KEY, USER_REPOSITORY, TOKEN_GENERATOR],
    },
  ],
})
export class AuthModule {}
