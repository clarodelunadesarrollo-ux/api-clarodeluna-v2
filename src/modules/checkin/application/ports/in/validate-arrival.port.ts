import { Reservation } from '../../../../reservations/domain/entities/reservation.entity';

export const VALIDATE_ARRIVAL_USE_CASE = Symbol('VALIDATE_ARRIVAL_USE_CASE');

export interface ValidateArrivalCommand {
  userId: string;
  code: string;
}

export interface ValidateArrivalUseCasePort {
  execute(command: ValidateArrivalCommand): Promise<Reservation>;
}
