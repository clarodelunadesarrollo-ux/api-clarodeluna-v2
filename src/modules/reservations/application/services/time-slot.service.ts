import {
    blackoutAffectsType,
} from '../../domain/enums/blackout-scope.enum';
import { ReservationType } from '../../domain/enums/reservation-type.enum';
import { BlockedDateException } from '../../domain/exceptions/blocked-date.exception';
import { InvalidTimeSlotException } from '../../domain/exceptions/invalid-time-slot.exception';
import { ScheduleWindow } from '../../domain/value-objects/schedule-window.vo';
import { ReservationBlackoutRepositoryPort } from '../ports/out/reservation-blackout-repository.port';
import { ReservationScheduleRepositoryPort } from '../ports/out/reservation-schedule-repository.port';

export const TIME_SLOT_SERVICE = Symbol('TIME_SLOT_SERVICE');

/**
 * Validates that a requested time is bookable for the given reservation type.
 * Both TOUR and RESTAURANT share the same open/close/interval model: the date
 * must not be blocked (blackout) and the time must be one of the generated
 * slots of that type's active schedule. Shared by the create and update use
 * cases to keep the rule in a single place.
 */
export class TimeSlotService {
  constructor(
    private readonly schedules: ReservationScheduleRepositoryPort,
    private readonly blackouts: ReservationBlackoutRepositoryPort,
  ) {}

  async ensureAvailable(
    type: ReservationType,
    date: Date,
    time: string,
  ): Promise<void> {
    const blackout = await this.blackouts.findByDate(date);
    if (blackout && blackoutAffectsType(blackout.scope, type)) {
      throw new BlockedDateException();
    }

    const schedule = await this.schedules.findByType(type);
    if (!schedule || !schedule.active) {
      throw new InvalidTimeSlotException();
    }

    const window = ScheduleWindow.create(
      schedule.openTime,
      schedule.closeTime,
      schedule.intervalMinutes,
    );
    if (!window.includes(time)) {
      throw new InvalidTimeSlotException();
    }
  }
}
