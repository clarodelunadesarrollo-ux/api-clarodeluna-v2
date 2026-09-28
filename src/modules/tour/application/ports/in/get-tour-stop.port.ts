import { TourStop } from '../../../domain/entities/tour-stop.entity';

export const GET_TOUR_STOP_USE_CASE = Symbol('GET_TOUR_STOP_USE_CASE');

export interface GetTourStopUseCasePort {
  execute(id: string): Promise<TourStop>;
}
