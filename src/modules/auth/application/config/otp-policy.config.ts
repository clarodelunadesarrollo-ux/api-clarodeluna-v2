export const OTP_POLICY_CONFIG = Symbol('OTP_POLICY_CONFIG');

export interface OtpPolicyConfig {
  ttlSeconds: number;
  maxAttempts: number;
  resendCooldownSeconds: number;
}
