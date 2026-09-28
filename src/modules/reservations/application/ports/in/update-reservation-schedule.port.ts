import { ReservationType } from '../../../domain/enums/reservation-type.enum';
import { ReservationScheduleView } from '../out/reservation-schedule-repository.port';

export const UPDATE_RESERVATION_SCHEDULE_USE_CASE = Symbol(
  'UPDATE_RESERVATION_SCHEDULE_USE_CASE',
);

export interface UpdateReservationScheduleCommand {
  type: ReservationType;
  openTime: string;
  closeTime: string;
  intervalMinutes: number;
  active: boolean;
}

export interface UpdateReservationScheduleUseCasePort {
  execute(
    command: UpdateReservationScheduleCommand,
  ): Promise<ReservationScheduleView>;
}
