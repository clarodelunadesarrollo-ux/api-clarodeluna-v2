import { InvalidScheduleException } from '../exceptions/invalid-schedule.exception';

const TIME_PATTERN = /^([01]\d|2[0-3]):[0-5]\d$/;

/**
 * Reservation schedule window value object. Encapsulates the invariants of a
 * bookable window and the generation of its selectable start times:
 *
 * - openTime / closeTime are "HH:mm" (24h) and openTime is strictly before
 *   closeTime (RN-1).
 * - intervalMinutes is a positive number of minutes that fits inside the window
 *   (RN-2): 0 < interval <= (close - open).
 * - Generated slots are open, open+interval, ... while strictly before close;
 *   closeTime is exclusive (RN-3).
 */
export class ScheduleWindow {
  private constructor(
    private readonly openMinutes: number,
    private readonly closeMinutes: number,
    private readonly intervalMinutes: number,
  ) {}

  static create(
    openTime: string,
    closeTime: string,
    intervalMinutes: number,
  ): ScheduleWindow {
    if (!TIME_PATTERN.test(openTime) || !TIME_PATTERN.test(closeTime)) {
      throw new InvalidScheduleException(
        'Los horarios deben tener el formato HH:mm.',
      );
    }

    const open = ScheduleWindow.toMinutes(openTime);
    const close = ScheduleWindow.toMinutes(closeTime);

    if (open >= close) {
      throw new InvalidScheduleException(
        'La hora de apertura debe ser anterior a la de cierre.',
      );
    }

    if (
      !Number.isInteger(intervalMinutes) ||
      intervalMinutes <= 0 ||
      intervalMinutes > close - open
    ) {
      throw new InvalidScheduleException(
        'El intervalo debe ser mayor a 0 y caber dentro del horario.',
      );
    }

    return new ScheduleWindow(open, close, intervalMinutes);
  }

  /** Returns the selectable start times as "HH:mm", closeTime exclusive. */
  generateSlots(): string[] {
    const slots: string[] = [];
    for (
      let minutes = this.openMinutes;
      minutes < this.closeMinutes;
      minutes += this.intervalMinutes
    ) {
      slots.push(ScheduleWindow.toTimeString(minutes));
    }
    return slots;
  }

  /** Whether `time` ("HH:mm") is one of the generated selectable start times. */
  includes(time: string): boolean {
    if (!TIME_PATTERN.test(time)) {
      return false;
    }
    const minutes = ScheduleWindow.toMinutes(time);
    return (
      minutes >= this.openMinutes &&
      minutes < this.closeMinutes &&
      (minutes - this.openMinutes) % this.intervalMinutes === 0
    );
  }

  private static toMinutes(time: string): number {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  }

  private static toTimeString(totalMinutes: number): string {
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
  }
}
