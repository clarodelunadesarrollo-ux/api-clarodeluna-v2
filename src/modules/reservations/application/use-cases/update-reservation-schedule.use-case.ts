import { ScheduleWindow } from '../../domain/value-objects/schedule-window.vo';
import {
    UpdateReservationScheduleCommand,
    UpdateReservationScheduleUseCasePort,
} from '../ports/in/update-reservation-schedule.port';
import {
    ReservationScheduleRepositoryPort,
    ReservationScheduleView,
} from '../ports/out/reservation-schedule-repository.port';

/**
 * Validates and persists the schedule for a reservation type. The schedule
 * invariants (open before close, interval fitting the window) are enforced by
 * ScheduleWindow before the upsert.
 */
export class UpdateReservationScheduleUseCase
  implements UpdateReservationScheduleUseCasePort
{
  constructor(
    private readonly schedules: ReservationScheduleRepositoryPort,
  ) {}

  async execute(
    command: UpdateReservationScheduleCommand,
  ): Promise<ReservationScheduleView> {
    ScheduleWindow.create(
      command.openTime,
      command.closeTime,
      command.intervalMinutes,
    );

    return this.schedules.upsert(command.type, {
      openTime: command.openTime,
      closeTime: command.closeTime,
      intervalMinutes: command.intervalMinutes,
      active: command.active,
    });
  }
}
