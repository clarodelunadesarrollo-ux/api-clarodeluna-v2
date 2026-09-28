export const OTP_HASHER = Symbol('OTP_HASHER');

export interface OtpHasherPort {
  hash(plain: string): Promise<string>;
  verify(plain: string, hashed: string): Promise<boolean>;
}
