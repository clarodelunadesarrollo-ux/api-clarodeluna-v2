import { BogotaClockPort } from '../../../../common/time/bogota-clock';
import { blackoutAffectsType } from '../../domain/enums/blackout-scope.enum';
import { ReservationType } from '../../domain/enums/reservation-type.enum';
import { ReservationDate } from '../../domain/value-objects/reservation-date.vo';
import { ScheduleWindow } from '../../domain/value-objects/schedule-window.vo';
import { ReservationPolicyConfig } from '../config/reservation-policy.config';
import { GetReservationSlotsUseCasePort } from '../ports/in/get-reservation-slots.port';
import { ReservationBlackoutRepositoryPort } from '../ports/out/reservation-blackout-repository.port';
import { ReservationScheduleRepositoryPort } from '../ports/out/reservation-schedule-repository.port';

/**
 * Returns the start times available for `type` on `date`. Generated from the
 * active schedule (open/close/interval); an empty list is returned when the
 * date is blocked for that type or the schedule is inactive. The date is
 * validated against the bookable window first.
 */
export class GetReservationSlotsUseCase
  implements GetReservationSlotsUseCasePort
{
  constructor(
    private readonly schedules: ReservationScheduleRepositoryPort,
    private readonly blackouts: ReservationBlackoutRepositoryPort,
    private readonly clock: BogotaClockPort,
    private readonly policy: ReservationPolicyConfig,
  ) {}

  async execute(type: ReservationType, date: string): Promise<string[]> {
    const validated = ReservationDate.create(
      date,
      this.clock.today(),
      this.policy.dateWindowDays,
    );

    const blackout = await this.blackouts.findByDate(validated.value);
    if (blackout && blackoutAffectsType(blackout.scope, type)) {
      return [];
    }

    const schedule = await this.schedules.findByType(type);
    if (!schedule || !schedule.active) {
      return [];
    }

    return ScheduleWindow.create(
      schedule.openTime,
      schedule.closeTime,
      schedule.intervalMinutes,
    ).generateSlots();
  }
}
