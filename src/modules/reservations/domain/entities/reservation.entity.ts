import { ReservationStatus } from '../enums/reservation-status.enum';
import { ReservationType } from '../enums/reservation-type.enum';
import { ReservationForbiddenException } from '../exceptions/reservation-forbidden.exception';
import { ReservationLockedException } from '../exceptions/reservation-locked.exception';

export interface ReservationSnapshot {
  id: string;
  userId: string;
  type: ReservationType;
  date: Date;
  time: string;
  partySize: number;
  holderName: string;
  status: ReservationStatus;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Reservation domain entity. Owns the ownership and lifecycle invariants:
 * only the owner may touch it, and it can only be modified while ACTIVE
 * (a CHECKED_IN or CANCELLED reservation is frozen).
 */
export class Reservation {
  private constructor(
    private readonly _id: string,
    private readonly _userId: string,
    private readonly _type: ReservationType,
    private readonly _date: Date,
    private readonly _time: string,
    private readonly _partySize: number,
    private readonly _holderName: string,
    private readonly _status: ReservationStatus,
    private readonly _createdAt: Date,
    private readonly _updatedAt: Date,
  ) {}

  static rehydrate(snapshot: ReservationSnapshot): Reservation {
    return new Reservation(
      snapshot.id,
      snapshot.userId,
      snapshot.type,
      snapshot.date,
      snapshot.time,
      snapshot.partySize,
      snapshot.holderName,
      snapshot.status,
      snapshot.createdAt,
      snapshot.updatedAt,
    );
  }

  ensureOwnedBy(userId: string): void {
    if (this._userId !== userId) {
      throw new ReservationForbiddenException();
    }
  }

  ensureModifiable(): void {
    if (this._status !== ReservationStatus.ACTIVE) {
      throw new ReservationLockedException();
    }
  }

  get id(): string {
    return this._id;
  }

  get userId(): string {
    return this._userId;
  }

  get type(): ReservationType {
    return this._type;
  }

  get date(): Date {
    return this._date;
  }

  /** Booked day as "YYYY-MM-DD" (UTC parts match the @db.Date round-trip). */
  get dateString(): string {
    const year = this._date.getUTCFullYear();
    const month = String(this._date.getUTCMonth() + 1).padStart(2, '0');
    const day = String(this._date.getUTCDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  get time(): string {
    return this._time;
  }

  get partySize(): number {
    return this._partySize;
  }

  get holderName(): string {
    return this._holderName;
  }

  get status(): ReservationStatus {
    return this._status;
  }

  get createdAt(): Date {
    return this._createdAt;
  }

  get updatedAt(): Date {
    return this._updatedAt;
  }
}
