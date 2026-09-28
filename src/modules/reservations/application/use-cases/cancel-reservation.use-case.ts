import { ReservationStatus } from '../../domain/enums/reservation-status.enum';
import { ReservationNotFoundException } from '../../domain/exceptions/reservation-not-found.exception';
import {
    CancelReservationCommand,
    CancelReservationUseCasePort,
} from '../ports/in/cancel-reservation.port';
import { ReservationRepositoryPort } from '../ports/out/reservation-repository.port';

/**
 * Logical deletion: marks an ACTIVE reservation the user owns as CANCELLED,
 * preserving history. Same ownership and lock guards as update.
 */
export class CancelReservationUseCase implements CancelReservationUseCasePort {
  constructor(private readonly reservations: ReservationRepositoryPort) {}

  async execute(command: CancelReservationCommand): Promise<void> {
    const existing = await this.reservations.findById(command.reservationId);
    if (!existing) {
      throw new ReservationNotFoundException();
    }
    existing.ensureOwnedBy(command.userId);
    existing.ensureModifiable();

    await this.reservations.updateStatus(
      command.reservationId,
      ReservationStatus.CANCELLED,
    );
  }
}
