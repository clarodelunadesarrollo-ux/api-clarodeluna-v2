import { BlackoutScope } from '../../../domain/enums/blackout-scope.enum';

export const RESERVATION_BLACKOUT_REPOSITORY = Symbol(
  'RESERVATION_BLACKOUT_REPOSITORY',
);

/** Read model of a blocked date. */
export interface ReservationBlackoutView {
  id: string;
  date: Date;
  scope: BlackoutScope;
  reason: string | null;
  createdAt: Date;
}

/** Fields required to create a blackout. */
export interface ReservationBlackoutInput {
  date: Date;
  scope: BlackoutScope;
  reason: string | null;
}

export interface ReservationBlackoutRepositoryPort {
  findAll(): Promise<ReservationBlackoutView[]>;
  findByDate(date: Date): Promise<ReservationBlackoutView | null>;
  create(input: ReservationBlackoutInput): Promise<ReservationBlackoutView>;
  delete(id: string): Promise<void>;
}
