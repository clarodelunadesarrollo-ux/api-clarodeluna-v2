import { ReservationBlackout } from '@prisma/client';

import { ReservationBlackoutView } from '../../../application/ports/out/reservation-blackout-repository.port';
import { BlackoutScope } from '../../../domain/enums/blackout-scope.enum';

export class ReservationBlackoutMapper {
  static toView(row: ReservationBlackout): ReservationBlackoutView {
    return {
      id: row.id,
      date: row.date,
      scope: row.scope as BlackoutScope,
      reason: row.reason,
      createdAt: row.createdAt,
    };
  }
}
