import { ReservationScheduleView } from '../../application/ports/out/reservation-schedule-repository.port';
import { ReservationType } from '../../domain/enums/reservation-type.enum';

export class ScheduleResponseDto {
  readonly type: ReservationType;
  readonly openTime: string;
  readonly closeTime: string;
  readonly intervalMinutes: number;
  readonly active: boolean;

  constructor(schedule: ReservationScheduleView) {
    this.type = schedule.type;
    this.openTime = schedule.openTime;
    this.closeTime = schedule.closeTime;
    this.intervalMinutes = schedule.intervalMinutes;
    this.active = schedule.active;
  }
}
