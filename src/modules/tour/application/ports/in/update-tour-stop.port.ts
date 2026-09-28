import { TourStop } from '../../../domain/entities/tour-stop.entity';

export const UPDATE_TOUR_STOP_USE_CASE = Symbol('UPDATE_TOUR_STOP_USE_CASE');

export interface UpdateTourStopCommand {
  order?: number;
  title?: string;
  description?: string;
  positionX?: number;
  positionY?: number;
  active?: boolean;
}

export interface UpdateTourStopUseCasePort {
  execute(id: string, command: UpdateTourStopCommand): Promise<TourStop>;
}
