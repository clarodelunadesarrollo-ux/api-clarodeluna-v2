import { InvalidReservationDateException } from '../exceptions/invalid-reservation-date.exception';

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

/**
 * Reservation date value object. Validates the "YYYY-MM-DD" format and enforces
 * the bookable window [today, today + windowDays] computed in America/Bogota.
 * The floor is always today; a date before today is never allowed.
 */
export class ReservationDate {
  private constructor(private readonly _value: Date) {}

  static create(raw: string, today: Date, windowDays: number): ReservationDate {
    if (!DATE_PATTERN.test(raw)) {
      throw new InvalidReservationDateException();
    }

    const parsed = new Date(`${raw}T00:00:00.000Z`);
    if (Number.isNaN(parsed.getTime())) {
      throw new InvalidReservationDateException();
    }

    const max = new Date(today.getTime());
    max.setUTCDate(max.getUTCDate() + windowDays);

    if (parsed.getTime() < today.getTime() || parsed.getTime() > max.getTime()) {
      throw new InvalidReservationDateException();
    }

    return new ReservationDate(parsed);
  }

  get value(): Date {
    return this._value;
  }
}
