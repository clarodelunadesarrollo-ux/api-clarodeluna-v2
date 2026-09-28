import { OtpValue } from '../../../domain/value-objects/otp-value.vo';

export const OTP_GENERATOR = Symbol('OTP_GENERATOR');

export interface OtpGeneratorPort {
  generate(): OtpValue;
}
