import { ReservationSchedule } from '@prisma/client';

import { ReservationScheduleView } from '../../../application/ports/out/reservation-schedule-repository.port';
import { ReservationType } from '../../../domain/enums/reservation-type.enum';

export class ReservationScheduleMapper {
  static toView(row: ReservationSchedule): ReservationScheduleView {
    return {
      type: row.type as ReservationType,
      openTime: row.openTime,
      closeTime: row.closeTime,
      intervalMinutes: row.intervalMinutes,
      active: row.active,
    };
  }
}
