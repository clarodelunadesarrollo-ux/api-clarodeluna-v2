import { BogotaClockPort } from '../../../../common/time/bogota-clock';
import { Reservation } from '../../domain/entities/reservation.entity';
import { ReservationNotFoundException } from '../../domain/exceptions/reservation-not-found.exception';
import { PartySize } from '../../domain/value-objects/party-size.vo';
import { ReservationDate } from '../../domain/value-objects/reservation-date.vo';
import { ReservationPolicyConfig } from '../config/reservation-policy.config';
import {
    UpdateReservationCommand,
    UpdateReservationUseCasePort,
} from '../ports/in/update-reservation.port';
import {
    ReservationChanges,
    ReservationRepositoryPort,
} from '../ports/out/reservation-repository.port';
import { TimeSlotService } from '../services/time-slot.service';

/**
 * Updates an ACTIVE reservation the user owns. Rejects unknown ids (404),
 * foreign reservations (403) and frozen ones (409). Revalidates the effective
 * date/time/party size without ever changing the reservation type.
 */
export class UpdateReservationUseCase implements UpdateReservationUseCasePort {
  constructor(
    private readonly reservations: ReservationRepositoryPort,
    private readonly timeSlots: TimeSlotService,
    private readonly clock: BogotaClockPort,
    private readonly policy: ReservationPolicyConfig,
  ) {}

  async execute(command: UpdateReservationCommand): Promise<Reservation> {
    const existing = await this.reservations.findById(command.reservationId);
    if (!existing) {
      throw new ReservationNotFoundException();
    }
    existing.ensureOwnedBy(command.userId);
    existing.ensureModifiable();

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
