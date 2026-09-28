export const CHECKIN_CONFIG = Symbol('CHECKIN_CONFIG');

/**
 * Runtime configuration for the venue-level check-in code generation.
 * `venueSecret` is the HMAC key; `periodSeconds` is the rotation window
 * (default 1 hour); `codeDigits` is the length of the derived numeric code.
 */
export interface CheckinConfig {
  venueSecret: string;
  periodSeconds: number;
  codeDigits: number;
}
