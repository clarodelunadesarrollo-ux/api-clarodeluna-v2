import { Injectable } from '@nestjs/common';

import { ClockPort } from '../../application/ports/out/clock.port';

@Injectable()
export class SystemClock implements ClockPort {
  now(): Date {
    return new Date();
  }
}
