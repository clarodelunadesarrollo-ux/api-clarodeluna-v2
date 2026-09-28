import { ReservationScheduleView } from '../../application/ports/out/reservation-schedule-repository.port';

export class RestaurantHoursResponseDto {
  readonly openTime: string;
  readonly closeTime: string;
  readonly intervalMinutes: number;

  constructor(schedule: ReservationScheduleView) {
    this.openTime = schedule.openTime;
    this.closeTime = schedule.closeTime;
    this.intervalMinutes = schedule.intervalMinutes;
  }
}
