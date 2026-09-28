import { ReservationType } from '../../../domain/enums/reservation-type.enum';

export const GET_RESERVATION_SLOTS_USE_CASE = Symbol(
  'GET_RESERVATION_SLOTS_USE_CASE',
);

export interface GetReservationSlotsUseCasePort {
  execute(type: ReservationType, date: string): Promise<string[]>;
}
