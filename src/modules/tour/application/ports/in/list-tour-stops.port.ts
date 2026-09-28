import { TourStop } from '../../../domain/entities/tour-stop.entity';

export const LIST_TOUR_STOPS_USE_CASE = Symbol('LIST_TOUR_STOPS_USE_CASE');

export interface ListTourStopsUseCasePort {
  execute(): Promise<TourStop[]>;
}
