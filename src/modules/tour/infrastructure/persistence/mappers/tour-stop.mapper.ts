import { TourStop as PrismaTourStop } from '@prisma/client';

import { TourStop } from '../../../domain/entities/tour-stop.entity';

export class TourStopMapper {
  static toDomain(row: PrismaTourStop): TourStop {
    return TourStop.rehydrate({
      id: row.id,
      order: row.order,
      title: row.title,
      description: row.description,
      positionX: row.positionX,
      positionY: row.positionY,
      active: row.active,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    });
  }
}
