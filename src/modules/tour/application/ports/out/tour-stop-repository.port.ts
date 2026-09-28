import { TourStop } from '../../../domain/entities/tour-stop.entity';

export const TOUR_STOP_REPOSITORY = Symbol('TOUR_STOP_REPOSITORY');

export interface CreateTourStopData {
  order: number;
  title: string;
  description: string;
  positionX: number;
  positionY: number;
  active: boolean;
}

export interface UpdateTourStopData {
  order?: number;
  title?: string;
  description?: string;
  positionX?: number;
  positionY?: number;
  active?: boolean;
}

export interface TourStopRepositoryPort {
  findAllActiveOrdered(): Promise<TourStop[]>;
  findById(id: string): Promise<TourStop | null>;
  create(data: CreateTourStopData): Promise<TourStop>;
  update(id: string, data: UpdateTourStopData): Promise<TourStop>;
  delete(id: string): Promise<void>;
}
