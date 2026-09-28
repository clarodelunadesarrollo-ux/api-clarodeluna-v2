import { Reservation } from '../../../domain/entities/reservation.entity';

export const UPDATE_RESERVATION_USE_CASE = Symbol('UPDATE_RESERVATION_USE_CASE');

export interface UpdateReservationCommand {
  userId: string;
  reservationId: string;
  date?: string;
  time?: string;
  partySize?: number;
}

export interface UpdateReservationUseCasePort {
  execute(command: UpdateReservationCommand): Promise<Reservation>;
}
