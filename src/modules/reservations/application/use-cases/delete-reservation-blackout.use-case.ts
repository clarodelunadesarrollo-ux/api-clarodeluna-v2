import {
    DeleteReservationBlackoutUseCasePort,
} from '../ports/in/delete-reservation-blackout.port';
import { ReservationBlackoutRepositoryPort } from '../ports/out/reservation-blackout-repository.port';

/** Removes a blocked date. Unknown ids are rejected by the repository (404). */
export class DeleteReservationBlackoutUseCase
  implements DeleteReservationBlackoutUseCasePort
{
  constructor(
    private readonly blackouts: ReservationBlackoutRepositoryPort,
  ) {}

  execute(id: string): Promise<void> {
    return this.blackouts.delete(id);
  }
}
