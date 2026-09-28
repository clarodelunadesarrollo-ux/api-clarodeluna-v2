import { BogotaClockPort } from '../../../../common/time/bogota-clock';
import { ReservationRepositoryPort } from '../../../reservations/application/ports/out/reservation-repository.port';
import { Reservation } from '../../../reservations/domain/entities/reservation.entity';
import { ReservationStatus } from '../../../reservations/domain/enums/reservation-status.enum';
import { CheckinOutsideWindowException } from '../../domain/exceptions/checkin-outside-window.exception';
import { InvalidCheckinCodeException } from '../../domain/exceptions/invalid-checkin-code.exception';
import { NoEligibleReservationException } from '../../domain/exceptions/no-eligible-reservation.exception';
import { CheckinConfig } from '../config/checkin.config';
import {
    ValidateArrivalCommand,
    ValidateArrivalUseCasePort,
} from '../ports/in/validate-arrival.port';
import { CheckinCodeGeneratorPort } from '../ports/out/checkin-code-generator.port';

const CHECKIN_OPENS_BEFORE_MS = 30 * 60 * 1000;
const CHECKIN_CLOSES_AFTER_MS = 15 * 60 * 1000;
const BOGOTA_UTC_OFFSET_HOURS = 5;

/**
 * Validates a self check-in against the current venue code and transitions the
 * user's nearest eligible reservation to CHECKED_IN. Eligibility is checked
 * before the code so the caller never learns whether a code is valid without a
 * reservation inside the time window (AD-6). No grace period is applied (AD-1).
 */
export class ValidateArrivalUseCase implements ValidateArrivalUseCasePort {
  constructor(
    private readonly reservations: ReservationRepositoryPort,
    private readonly generator: CheckinCodeGeneratorPort,
    private readonly clock: BogotaClockPort,
    private readonly config: CheckinConfig,
  ) {}

  async execute({
    userId,
    code,
  }: ValidateArrivalCommand): Promise<Reservation> {
    const nowMs = this.clock.now().getTime();

    const active = (await this.reservations.findByUserId(userId)).filter(
      (reservation) => reservation.status === ReservationStatus.ACTIVE,
    );
    if (active.length === 0) {
      throw new NoEligibleReservationException();
    }

    const eligible = active
      .filter((reservation) => this.isWithinWindow(reservation, nowMs))
      .sort((a, b) => this.reservationInstantMs(a) - this.reservationInstantMs(b));
    if (eligible.length === 0) {
      throw new CheckinOutsideWindowException();
    }

    const counter = Math.floor(nowMs / 1000 / this.config.periodSeconds);
    if (this.generator.derive(counter) !== code) {
      throw new InvalidCheckinCodeException();
    }

    return this.reservations.updateStatus(
      eligible[0].id,
      ReservationStatus.CHECKED_IN,
    );
  }

  private isWithinWindow(reservation: Reservation, nowMs: number): boolean {
    const reservationMs = this.reservationInstantMs(reservation);
    return (
      nowMs >= reservationMs - CHECKIN_OPENS_BEFORE_MS &&
      nowMs <= reservationMs + CHECKIN_CLOSES_AFTER_MS
    );
  }

  /**
   * Real UTC instant of the reservation. `date` is stored at UTC midnight of the
   * Bogota day and `time` is Bogota wall-clock; adding the fixed UTC-5 offset
   * (Date.UTC normalizes hour/day overflow) yields the actual UTC instant.
   */
  private reservationInstantMs(reservation: Reservation): number {
    const [hours, minutes] = reservation.time.split(':').map(Number);
    const date = reservation.date;
    return Date.UTC(
      date.getUTCFullYear(),
      date.getUTCMonth(),
      date.getUTCDate(),
      hours + BOGOTA_UTC_OFFSET_HOURS,
      minutes,
      0,
      0,
    );
  }
}
