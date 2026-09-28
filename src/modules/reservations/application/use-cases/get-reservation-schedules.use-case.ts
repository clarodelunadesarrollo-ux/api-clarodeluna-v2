import {
    GetReservationSchedulesUseCasePort,
} from '../ports/in/get-reservation-schedules.port';
import {
    ReservationScheduleRepositoryPort,
    ReservationScheduleView,
} from '../ports/out/reservation-schedule-repository.port';

/** Returns every configured reservation-type schedule for the admin panel. */
export class GetReservationSchedulesUseCase
  implements GetReservationSchedulesUseCasePort
{
  constructor(
    private readonly schedules: ReservationScheduleRepositoryPort,
  ) {}

  execute(): Promise<ReservationScheduleView[]> {
    return this.schedules.findAll();
  }
}
