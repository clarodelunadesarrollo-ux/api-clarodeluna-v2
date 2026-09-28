import { InvalidReservationDateException } from '../exceptions/invalid-reservation-date.exception';
import { ReservationDate } from './reservation-date.vo';

describe('ReservationDate', () => {
  const TODAY = new Date('2026-09-26T00:00:00.000Z');
  const WINDOW = 30;

  it('accepts today (the window floor)', () => {
    const date = ReservationDate.create('2026-09-26', TODAY, WINDOW);
    expect(date.value.toISOString()).toBe('2026-09-26T00:00:00.000Z');
  });

  it('accepts the last day of the window', () => {
    const date = ReservationDate.create('2026-10-26', TODAY, WINDOW);
    expect(date.value.toISOString()).toBe('2026-10-26T00:00:00.000Z');
  });

  it('rejects a date before today', () => {
    expect(() => ReservationDate.create('2026-09-25', TODAY, WINDOW)).toThrow(
      InvalidReservationDateException,
    );
  });

  it('rejects a date past the window ceiling', () => {
    expect(() => ReservationDate.create('2026-10-27', TODAY, WINDOW)).toThrow(
      InvalidReservationDateException,
    );
  });

  it('rejects a malformed date string', () => {
    expect(() => ReservationDate.create('26/09/2026', TODAY, WINDOW)).toThrow(
      InvalidReservationDateException,
    );
  });

  it('rejects a syntactically valid but impossible date', () => {
    expect(() => ReservationDate.create('2026-02-30', TODAY, WINDOW)).toThrow(
      InvalidReservationDateException,
    );
  });
});
