import { Reservation } from '../../../domain/entities/reservation.entity';
import { ReservationStatus } from '../../../domain/enums/reservation-status.enum';
import { ReservationType } from '../../../domain/enums/reservation-type.enum';

export const RESERVATION_REPOSITORY = Symbol('RESERVATION_REPOSITORY');

export interface NewReservation {
  userId: string;
  type: ReservationType;
  date: Date;
  time: string;
  partySize: number;
  holderName: string;
}

export interface ReservationChanges {
  date?: Date;
  time?: string;
  partySize?: number;
  status?: ReservationStatus;
}

export interface ReservationFilter {
  type?: ReservationType;
  status?: ReservationStatus;
}

export interface ReservationRepositoryPort {
  create(data: NewReservation): Promise<Reservation>;
  findById(id: string): Promise<Reservation | null>;
  findByUserId(userId: string): Promise<Reservation[]>;
  findAll(filter?: ReservationFilter): Promise<Reservation[]>;
  countActiveToursFrom(userId: string, fromDate: Date): Promise<number>;
  update(id: string, changes: ReservationChanges): Promise<Reservation>;
  updateStatus(id: string, status: ReservationStatus): Promise<Reservation>;
  delete(id: string): Promise<void>;
}
