import { ReservationScheduleView } from '../out/reservation-schedule-repository.port';

export const GET_RESERVATION_SCHEDULES_USE_CASE = Symbol(
  'GET_RESERVATION_SCHEDULES_USE_CASE',
);

export interface GetReservationSchedulesUseCasePort {
  execute(): Promise<ReservationScheduleView[]>;
}
