import { Injectable } from '@nestjs/common';

export const BOGOTA_CLOCK = Symbol('BOGOTA_CLOCK');

export interface BogotaClockPort {
  now(): Date;
  today(): Date;
  todayString(): string;
}

/**
 * Clock anchored to America/Bogota (fixed UTC-5, no DST).
 * `today()` returns the current Bogota calendar day normalized to UTC midnight
 * (matches how Prisma `@db.Date` values round-trip); `todayString()` returns it
 * as "YYYY-MM-DD" for date-window comparisons.
 */
@Injectable()
export class BogotaClock implements BogotaClockPort {
  private static readonly UTC_OFFSET_MS = 5 * 60 * 60 * 1000;

  now(): Date {
    return new Date();
  }

  today(): Date {
    const bogota = new Date(this.now().getTime() - BogotaClock.UTC_OFFSET_MS);
    return new Date(
      Date.UTC(
        bogota.getUTCFullYear(),
        bogota.getUTCMonth(),
        bogota.getUTCDate(),
      ),
    );
  }

  todayString(): string {
    const today = this.today();
    const year = today.getUTCFullYear();
    const month = String(today.getUTCMonth() + 1).padStart(2, '0');
    const day = String(today.getUTCDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}
