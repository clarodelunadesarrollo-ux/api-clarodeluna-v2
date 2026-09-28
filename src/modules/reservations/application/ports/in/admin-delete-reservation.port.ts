export const ADMIN_DELETE_RESERVATION_USE_CASE = Symbol(
  'ADMIN_DELETE_RESERVATION_USE_CASE',
);

export interface AdminDeleteReservationUseCasePort {
  execute(reservationId: string): Promise<void>;
}
