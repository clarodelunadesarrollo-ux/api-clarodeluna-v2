export const CANCEL_RESERVATION_USE_CASE = Symbol('CANCEL_RESERVATION_USE_CASE');

export interface CancelReservationCommand {
  userId: string;
  reservationId: string;
}

export interface CancelReservationUseCasePort {
  execute(command: CancelReservationCommand): Promise<void>;
}
