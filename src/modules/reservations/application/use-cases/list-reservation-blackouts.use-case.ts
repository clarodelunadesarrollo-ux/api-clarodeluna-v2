import {
    ListReservationBlackoutsUseCasePort,
} from '../ports/in/list-reservation-blackouts.port';
import {
    ReservationBlackoutRepositoryPort,
    ReservationBlackoutView,
} from '../ports/out/reservation-blackout-repository.port';

/** Returns every blocked date for the admin panel. */
export class ListReservationBlackoutsUseCase
  implements ListReservationBlackoutsUseCasePort
{
  constructor(
    private readonly blackouts: ReservationBlackoutRepositoryPort,
  ) {}

  execute(): Promise<ReservationBlackoutView[]> {
    return this.blackouts.findAll();
  }
}
