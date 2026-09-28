export const REQUEST_OTP_USE_CASE = Symbol('REQUEST_OTP_USE_CASE');

export interface RequestOtpResult {
  otp: string;
  expiresAt: Date;
  resendAvailableAt: Date;
}

export interface RequestOtpUseCasePort {
  execute(email: string): Promise<RequestOtpResult>;
}
