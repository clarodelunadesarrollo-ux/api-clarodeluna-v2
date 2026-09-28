import { BlackoutScope } from '../../../domain/enums/blackout-scope.enum';
import { ReservationBlackoutView } from '../out/reservation-blackout-repository.port';

export const CREATE_RESERVATION_BLACKOUT_USE_CASE = Symbol(
  'CREATE_RESERVATION_BLACKOUT_USE_CASE',
);

export interface CreateReservationBlackoutCommand {
  date: string;
  scope: BlackoutScope;
  reason?: string;
}

export interface CreateReservationBlackoutUseCasePort {
  execute(
    command: CreateReservationBlackoutCommand,
  ): Promise<ReservationBlackoutView>;
}
