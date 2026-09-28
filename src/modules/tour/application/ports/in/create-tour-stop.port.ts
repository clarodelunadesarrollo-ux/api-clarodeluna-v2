import { TourStop } from '../../../domain/entities/tour-stop.entity';

export const CREATE_TOUR_STOP_USE_CASE = Symbol('CREATE_TOUR_STOP_USE_CASE');

export interface CreateTourStopCommand {
  order: number;
  title: string;
  description: string;
  positionX: number;
  positionY: number;
  active?: boolean;
}

export interface CreateTourStopUseCasePort {
  execute(command: CreateTourStopCommand): Promise<TourStop>;
}
