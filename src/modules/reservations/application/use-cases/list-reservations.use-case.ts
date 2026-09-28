import { Reservation } from '../../domain/entities/reservation.entity';
import { ListReservationsUseCasePort } from '../ports/in/list-reservations.port';
import { ReservationRepositoryPort } from '../ports/out/reservation-repository.port';

/**
 * Returns every reservation of the user (including CHECKED_IN / CANCELLED
 * history), ordered by date and time.
 */
export class ListReservationsUseCase implements ListReservationsUseCasePort {
  constructor(private readonly reservations: ReservationRepositoryPort) {}

  execute(userId: string): Promise<Reservation[]> {
    return this.reservations.findByUserId(userId);
  }
}
