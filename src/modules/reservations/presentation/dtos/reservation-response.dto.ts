import { Reservation } from '../../domain/entities/reservation.entity';

/**
 * `data` payload for the reservation endpoints. Field names are the exact
 * camelCase keys the Flutter client parses.
 */
export class ReservationResponseDto {
  readonly id: string;
  readonly type: string;
  readonly date: string;
  readonly time: string;
  readonly partySize: number;
  readonly holderName: string;
  readonly status: string;
  readonly createdAt: string;

  constructor(reservation: Reservation) {
    this.id = reservation.id;
    this.type = reservation.type;
    this.date = reservation.dateString;
    this.time = reservation.time;
    this.partySize = reservation.partySize;
    this.holderName = reservation.holderName;
    this.status = reservation.status;
    this.createdAt = reservation.createdAt.toISOString();
  }
}
