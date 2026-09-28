import { Reservation } from '../../../domain/entities/reservation.entity';

export const LIST_RESERVATIONS_USE_CASE = Symbol('LIST_RESERVATIONS_USE_CASE');

export interface ListReservationsUseCasePort {
  execute(userId: string): Promise<Reservation[]>;
}
