import { TourStop } from '../../domain/entities/tour-stop.entity';

export class TourStopResponseDto {
  readonly id: string;
  readonly order: number;
  readonly title: string;
  readonly description: string;
  readonly positionX: number;
  readonly positionY: number;
  readonly active: boolean;
  readonly createdAt: string;
  readonly updatedAt: string;

  constructor(stop: TourStop) {
    this.id = stop.id;
    this.order = stop.order;
    this.title = stop.title;
    this.description = stop.description;
    this.positionX = stop.positionX;
    this.positionY = stop.positionY;
    this.active = stop.active;
    this.createdAt = stop.createdAt.toISOString();
    this.updatedAt = stop.updatedAt.toISOString();
  }
}
