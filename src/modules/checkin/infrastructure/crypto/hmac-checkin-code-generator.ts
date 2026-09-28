import { createHmac } from 'crypto';

import { CheckinConfig } from '../../application/config/checkin.config';
import { CheckinCodeGeneratorPort } from '../../application/ports/out/checkin-code-generator.port';

/**
 * HOTP-style (RFC 4226) code generator. The rotation counter is HMAC-SHA256'd
 * with the venue secret, dynamically truncated to a 31-bit integer, then
 * reduced modulo 10^codeDigits and left-padded. Deterministic per counter.
 */
export class HmacCheckinCodeGenerator implements CheckinCodeGeneratorPort {
  constructor(private readonly config: CheckinConfig) {}

  derive(counter: number): string {
    const counterBuffer = Buffer.alloc(8);
    counterBuffer.writeBigUInt64BE(BigInt(counter));

    const hs = createHmac('sha256', this.config.venueSecret)
      .update(counterBuffer)
      .digest();

    const offset = hs[hs.length - 1] & 0x0f;
    const binary =
      ((hs[offset] & 0x7f) << 24) |
      ((hs[offset + 1] & 0xff) << 16) |
      ((hs[offset + 2] & 0xff) << 8) |
      (hs[offset + 3] & 0xff);

    const modulo = 10 ** this.config.codeDigits;
    return String(binary % modulo).padStart(this.config.codeDigits, '0');
  }
}
