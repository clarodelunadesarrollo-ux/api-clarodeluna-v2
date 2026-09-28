import { randomInt } from 'node:crypto';

import { Injectable } from '@nestjs/common';

import { OtpGeneratorPort } from '../../application/ports/out/otp-generator.port';
import { OtpValue } from '../../domain/value-objects/otp-value.vo';

const OTP_UPPER_BOUND = 1_000_000; // exclusive: yields 000000-999999

@Injectable()
export class CryptoOtpGenerator implements OtpGeneratorPort {
  generate(): OtpValue {
    // randomInt is cryptographically secure and uniform over [0, OTP_UPPER_BOUND).
    const value = randomInt(0, OTP_UPPER_BOUND).toString().padStart(6, '0');
    return OtpValue.create(value);
  }
}
