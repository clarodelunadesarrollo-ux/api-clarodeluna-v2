import { TokenPair } from '../out/token-generator.port';

export const VALIDATE_OTP_USE_CASE = Symbol('VALIDATE_OTP_USE_CASE');

export interface ValidateOtpUseCasePort {
  execute(email: string, otp: string): Promise<TokenPair>;
}
