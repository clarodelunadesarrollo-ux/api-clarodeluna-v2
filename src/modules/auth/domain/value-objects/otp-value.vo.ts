const OTP_PATTERN = /^[0-9]{6}$/;

/**
 * OTP value object: exactly 6 numeric digits (zero-padded, 000000-999999).
 * The format is an internal invariant guaranteed by the generator adapter.
 */
export class OtpValue {
  private constructor(private readonly _value: string) {}

  static create(raw: string): OtpValue {
    if (!OTP_PATTERN.test(raw)) {
      throw new Error('OTP value must be exactly 6 numeric digits');
    }
    return new OtpValue(raw);
  }

  get value(): string {
    return this._value;
  }
}
