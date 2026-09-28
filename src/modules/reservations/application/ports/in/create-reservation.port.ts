import { Reservation } from '../../../domain/entities/reservation.entity';
import { ReservationType } from '../../../domain/enums/reservation-type.enum';

export const CREATE_RESERVATION_USE_CASE = Symbol('CREATE_RESERVATION_USE_CASE');

export interface CreateReservationCommand {
  userId: string;
  email: string;
  type: ReservationType;
  date: string;
  time: string;
  partySize: number;
}

export interface CreateReservationUseCasePort {
  execute(command: CreateReservationCommand): Promise<Reservation>;
}
