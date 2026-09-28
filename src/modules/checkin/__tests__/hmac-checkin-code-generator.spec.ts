import { CheckinConfig } from '../application/config/checkin.config';
import { HmacCheckinCodeGenerator } from '../infrastructure/crypto/hmac-checkin-code-generator';

describe('HmacCheckinCodeGenerator', () => {
  const config: CheckinConfig = {
    venueSecret: 'test_checkin_venue_secret_min_32_characters',
    periodSeconds: 3600,
    codeDigits: 4,
  };
  const generator = new HmacCheckinCodeGenerator(config);

  it('is deterministic for the same counter', () => {
    expect(generator.derive(100)).toBe(generator.derive(100));
  });

  it('produces a zero-padded numeric code of the configured length', () => {
    for (let counter = 0; counter < 100; counter++) {
      expect(generator.derive(counter)).toMatch(/^\d{4}$/);
    }
  });

  it('produces different codes across neighbouring counters', () => {
    const codes = new Set<string>();
    for (let counter = 0; counter < 20; counter++) {
      codes.add(generator.derive(counter));
    }
    // Not all 20 codes should collapse to a single value.
    expect(codes.size).toBeGreaterThan(1);
  });

  it('depends on the secret', () => {
    const other = new HmacCheckinCodeGenerator({
      ...config,
      venueSecret: 'a_completely_different_secret_min_32_chars',
    });
    const mismatches = Array.from({ length: 30 }, (_, counter) => counter).some(
      (counter) => generator.derive(counter) !== other.derive(counter),
    );
    expect(mismatches).toBe(true);
  });
});
