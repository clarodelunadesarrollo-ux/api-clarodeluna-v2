export const DELETE_TOUR_STOP_USE_CASE = Symbol('DELETE_TOUR_STOP_USE_CASE');

export interface DeleteTourStopUseCasePort {
  execute(id: string): Promise<void>;
}
