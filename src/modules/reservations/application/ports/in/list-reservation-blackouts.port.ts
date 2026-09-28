import { ReservationBlackoutView } from '../out/reservation-blackout-repository.port';

export const LIST_RESERVATION_BLACKOUTS_USE_CASE = Symbol(
  'LIST_RESERVATION_BLACKOUTS_USE_CASE',
);

export interface ListReservationBlackoutsUseCasePort {
  execute(): Promise<ReservationBlackoutView[]>;
}
