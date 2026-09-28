import { ReservationType } from '../../domain/enums/reservation-type.enum';
import { InvalidTimeSlotException } from '../../domain/exceptions/invalid-time-slot.exception';
import { GetRestaurantHoursUseCasePort } from '../ports/in/get-restaurant-hours.port';
import {
    ReservationScheduleRepositoryPort,
    ReservationScheduleView,
} from '../ports/out/reservation-schedule-repository.port';

/**
 * Returns the active restaurant schedule (open/close/interval) so the client
 * can derive selectable times.
 */
export class GetRestaurantHoursUseCase
  implements GetRestaurantHoursUseCasePort
{
  constructor(
    private readonly schedules: ReservationScheduleRepositoryPort,
  ) {}

  async execute(): Promise<ReservationScheduleView> {
    const schedule = await this.schedules.findByType(
      ReservationType.RESTAURANT,
    );
    if (!schedule || !schedule.active) {
      throw new InvalidTimeSlotException();
    }
    return schedule;
  }
}
