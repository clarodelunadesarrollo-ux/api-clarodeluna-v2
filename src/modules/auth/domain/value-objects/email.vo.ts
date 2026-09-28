import { InvalidEmailException } from '../exceptions/invalid-email.exception';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Email value object. Owns the format invariant and normalizes to a trimmed,
 * lowercased canonical form used for lookups and persistence.
 */
export class Email {
  private constructor(private readonly _value: string) {}

  static create(raw: string): Email {
    const normalized = raw.trim().toLowerCase();
    if (!EMAIL_PATTERN.test(normalized)) {
      throw new InvalidEmailException(`Invalid email format: ${raw}`);
    }
    return new Email(normalized);
  }

  get value(): string {
    return this._value;
  }
}
