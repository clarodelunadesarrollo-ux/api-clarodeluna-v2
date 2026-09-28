import { OtpCode } from '../../../domain/entities/otp-code.entity';

export const OTP_CODE_REPOSITORY = Symbol('OTP_CODE_REPOSITORY');

export interface CreateOtpCodeInput {
  userId: string;
  hashedCode: string;
  expiresAt: Date;
  createdAt: Date;
}

export interface OtpCodeRepositoryPort {
  create(input: CreateOtpCodeInput): Promise<OtpCode>;
  findLatestByUserId(userId: string): Promise<OtpCode | null>;
  findLatestActiveByUserId(userId: string): Promise<OtpCode | null>;
  invalidateActiveByUserId(userId: string): Promise<void>;
  save(otpCode: OtpCode): Promise<void>;
}
