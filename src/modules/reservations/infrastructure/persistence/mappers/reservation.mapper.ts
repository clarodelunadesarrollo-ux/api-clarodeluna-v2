import { Reservation as PrismaReservation } from '@prisma/client';

import { Reservation } from '../../../domain/entities/reservation.entity';
import { ReservationStatus } from '../../../domain/enums/reservation-status.enum';
import { ReservationType } from '../../../domain/enums/reservation-type.enum';

export class ReservationMapper {
  static toDomain(row: PrismaReservation): Reservation {
    return Reservation.rehydrate({
      id: row.id,
      userId: row.userId,
      type: row.type as ReservationType,
      date: row.date,
      time: row.time,
      partySize: row.partySize,
      holderName: row.holderName,
      status: row.status as ReservationStatus,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    });
  }
}
