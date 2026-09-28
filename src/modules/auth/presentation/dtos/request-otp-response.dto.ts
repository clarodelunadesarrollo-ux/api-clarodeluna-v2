export interface RequestOtpResponseProps {
  otp?: string;
  expiresAt: string;
  resendAvailableAt: string;
}

/**
 * `data` payload for POST /auth/otp/request. Field names are the exact camelCase
 * keys the Flutter client parses. `otp` is only present while
 * EXPOSE_OTP_IN_RESPONSE is enabled (DEV phase); it is omitted otherwise.
 */
export class RequestOtpResponseDto {
  readonly otp?: string;
  readonly expiresAt: string;
  readonly resendAvailableAt: string;

  constructor(props: RequestOtpResponseProps) {
    if (props.otp !== undefined) {
      this.otp = props.otp;
    }
    this.expiresAt = props.expiresAt;
    this.resendAvailableAt = props.resendAvailableAt;
  }
}
