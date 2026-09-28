import { InvalidPartySizeException } from '../exceptions/invalid-party-size.exception';
import { PartySize } from './party-size.vo';

describe('PartySize', () => {
  it.each([1, 4, 8])('accepts %i as a valid size', (value) => {
    expect(PartySize.create(value).value).toBe(value);
  });

  it.each([0, 9, -1])('rejects out-of-range %i', (value) => {
    expect(() => PartySize.create(value)).toThrow(InvalidPartySizeException);
  });

  it('rejects non-integer sizes', () => {
    expect(() => PartySize.create(2.5)).toThrow(InvalidPartySizeException);
  });
});
