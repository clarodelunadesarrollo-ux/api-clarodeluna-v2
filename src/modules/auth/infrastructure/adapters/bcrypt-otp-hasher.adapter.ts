import { Injectable } from '@nestjs/common';
// bcryptjs is a pure-JS implementation (no native bindings / node-gyp), which
// avoids compilation failures on Node 24 that the native `bcrypt` package hits.
import { compare, hash } from 'bcryptjs';

import { OtpHasherPort } from '../../application/ports/out/otp-hasher.port';

const SALT_ROUNDS = 10;

@Injectable()
export class BcryptOtpHasher implements OtpHasherPort {
  async hash(plain: string): Promise<string> {
    return hash(plain, SALT_ROUNDS);
  }

  async verify(plain: string, hashed: string): Promise<boolean> {
    return compare(plain, hashed);
  }
}
