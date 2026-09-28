export const DELETE_RESERVATION_BLACKOUT_USE_CASE = Symbol(
  'DELETE_RESERVATION_BLACKOUT_USE_CASE',
);

export interface DeleteReservationBlackoutUseCasePort {
  execute(id: string): Promise<void>;
}
