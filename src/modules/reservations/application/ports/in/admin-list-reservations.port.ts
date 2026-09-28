import { Reservation } from '../../../domain/entities/reservation.entity';
import { ReservationStatus } from '../../../domain/enums/reservation-status.enum';
import { ReservationType } from '../../../domain/enums/reservation-type.enum';

export const ADMIN_LIST_RESERVATIONS_USE_CASE = Symbol(
  'ADMIN_LIST_RESERVATIONS_USE_CASE',
);

export interface AdminListReservationsFilter {
  type?: ReservationType;
  status?: ReservationStatus;
}

export interface AdminListReservationsUseCasePort {
  execute(filter: AdminListReservationsFilter): Promise<Reservation[]>;
}
