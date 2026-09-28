import { BogotaClockPort } from '../../../../common/time/bogota-clock';
import { Reservation } from '../../domain/entities/reservation.entity';
import { ReservationNotFoundException } from '../../domain/exceptions/reservation-not-found.exception';
import { PartySize } from '../../domain/value-objects/party-size.vo';
import { ReservationDate } from '../../domain/value-objects/reservation-date.vo';
import { ReservationPolicyConfig } from '../config/reservation-policy.config';
import {
    AdminUpdateReservationCommand,
    AdminUpdateReservationUseCasePort,
} from '../ports/in/admin-update-reservation.port';
import {
    ReservationChanges,
    ReservationRepositoryPort,
} from '../ports/out/reservation-repository.port';
import { TimeSlotService } from '../services/time-slot.service';

/**
 * Admin edit of any reservation (no ownership or lock guards). Revalidates
 * date/time/party size with the same domain rules as the guest flow and can
 * also change the status (check-in / reactivate / cancel). The reservation
 * type is never changed.
 */
export class AdminUpdateReservationUseCase
  implements AdminUpdateReservationUseCasePort
{
  constructor(
    private readonly reservations: ReservationRepositoryPort,
    private readonly timeSlots: TimeSlotService,
    private readonly clock: BogotaClockPort,
    private readonly policy: ReservationPolicyConfig,
  ) {}

  async execute(command: AdminUpdateReservationCommand): Promise<Reservation> {
    const existing = await this.reservations.findById(command.reservationId);
    if (!existing) {
      throw new ReservationNotFoundException();
    }

    const changes: ReservationChanges = {};
    let effectiveDate = existing.date;

    if (command.date !== undefined) {
      const date = ReservationDate.create(
        command.date,
        this.clock.today(),
        this.policy.dateWindowDays,
      );
      changes.date = date.value;
      effectiveDate = date.value;
    }

    if (command.partySize !== undefined) {
      changes.partySize = PartySize.create(command.partySize).value;
    }

    if (command.time !== undefined) {
      changes.time = command.time;
    }

    if (command.status !== undefined) {
      changes.status = command.status;
    }

    if (command.date !== undefined || command.time !== undefined) {
      const effectiveTime = command.time ?? existing.time;
      await this.timeSlots.ensureAvailable(
        existing.type,
        effectiveDate,
        effectiveTime,
      );
    }

    return this.reservations.update(command.reservationId, changes);
  }
}
