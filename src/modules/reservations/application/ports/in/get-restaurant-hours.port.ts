import { ReservationScheduleView } from '../out/reservation-schedule-repository.port';

export const GET_RESTAURANT_HOURS_USE_CASE = Symbol('GET_RESTAURANT_HOURS_USE_CASE');

export interface GetRestaurantHoursUseCasePort {
  execute(): Promise<ReservationScheduleView>;
}
