import { ReservationNotFoundException } from '../../domain/exceptions/reservation-not-found.exception';
import { AdminDeleteReservationUseCasePort } from '../ports/in/admin-delete-reservation.port';
import { ReservationRepositoryPort } from '../ports/out/reservation-repository.port';

/**
 * Admin hard-delete of any reservation. Irreversible: the row is removed from
 * the database. Rejects unknown ids with 404.
 */
export class AdminDeleteReservationUseCase
  implements AdminDeleteReservationUseCasePort
{
  constructor(private readonly reservations: ReservationRepositoryPort) {}

  async execute(reservationId: string): Promise<void> {
    const existing = await this.reservations.findById(reservationId);
    if (!existing) {
      throw new ReservationNotFoundException();
    }
    await this.reservations.delete(reservationId);
  }
}
