import { ReservationType } from '../../../domain/enums/reservation-type.enum';

export const RESERVATION_SCHEDULE_REPOSITORY = Symbol(
  'RESERVATION_SCHEDULE_REPOSITORY',
);

/** Read model of a single reservation-type schedule. */
export interface ReservationScheduleView {
  type: ReservationType;
  openTime: string;
  closeTime: string;
  intervalMinutes: number;
  active: boolean;
}

/** Fields an admin can update on a schedule. */
export interface ReservationScheduleInput {
  openTime: string;
  closeTime: string;
  intervalMinutes: number;
  active: boolean;
}

export interface ReservationScheduleRepositoryPort {
  findByType(type: ReservationType): Promise<ReservationScheduleView | null>;
  findAll(): Promise<ReservationScheduleView[]>;
  upsert(
    type: ReservationType,
    input: ReservationScheduleInput,
  ): Promise<ReservationScheduleView>;
}
