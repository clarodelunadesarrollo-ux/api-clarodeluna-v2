import { Reservation } from '../../../domain/entities/reservation.entity';
import { ReservationStatus } from '../../../domain/enums/reservation-status.enum';

export const ADMIN_UPDATE_RESERVATION_USE_CASE = Symbol(
  'ADMIN_UPDATE_RESERVATION_USE_CASE',
);

export interface AdminUpdateReservationCommand {
  reservationId: string;
  date?: string;
  time?: string;
  partySize?: number;
  status?: ReservationStatus;
}

export interface AdminUpdateReservationUseCasePort {
  execute(command: AdminUpdateReservationCommand): Promise<Reservation>;
}
