import { InvalidPartySizeException } from '../exceptions/invalid-party-size.exception';

/**
 * Party size value object. Owns the 1..8 invariant shared by create and update.
 */
export class PartySize {
  private constructor(private readonly _value: number) {}

  static create(raw: number): PartySize {
    if (!Number.isInteger(raw) || raw < 1 || raw > 8) {
      throw new InvalidPartySizeException();
    }
    return new PartySize(raw);
  }

  get value(): number {
    return this._value;
  }
}
