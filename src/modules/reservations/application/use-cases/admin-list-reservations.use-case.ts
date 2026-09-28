import { Reservation } from '../../domain/entities/reservation.entity';
import {
    AdminListReservationsFilter,
    AdminListReservationsUseCasePort,
} from '../ports/in/admin-list-reservations.port';
import { ReservationRepositoryPort } from '../ports/out/reservation-repository.port';

/**
 * Admin listing of every reservation (all users), optionally filtered by type
 * and/or status. Read-only; ordering is delegated to the repository.
 */
export class AdminListReservationsUseCase
  implements AdminListReservationsUseCasePort
{
  constructor(private readonly reservations: ReservationRepositoryPort) {}

  execute(filter: AdminListReservationsFilter): Promise<Reservation[]> {
    return this.reservations.findAll({
      type: filter.type,
      status: filter.status,
    });
  }
}
