import { OtpStatus } from '../enums/otp-status.enum';

export interface OtpCodeSnapshot {
  id: string;
  userId: string;
  hashedCode: string;
  attempts: number;
  status: OtpStatus;
  expiresAt: Date;
  consumedAt: Date | null;
  createdAt: Date;
}

/**
 * OtpCode domain entity. Owns the lifecycle invariants of a one-time code:
 * expiration, failed-attempt budget, and status transitions.
 */
export class OtpCode {
  private constructor(
    private readonly _id: string,
    private readonly _userId: string,
    private readonly _hashedCode: string,
    private _attempts: number,
    private _status: OtpStatus,
    private readonly _expiresAt: Date,
    private _consumedAt: Date | null,
    private readonly _createdAt: Date,
  ) {}

  static rehydrate(snapshot: OtpCodeSnapshot): OtpCode {
    return new OtpCode(
      snapshot.id,
      snapshot.userId,
      snapshot.hashedCode,
      snapshot.attempts,
      snapshot.status,
      snapshot.expiresAt,
      snapshot.consumedAt,
      snapshot.createdAt,
    );
  }

  isExpired(now: Date): boolean {
    return now.getTime() >= this._expiresAt.getTime();
  }

  registerFailedAttempt(): void {
    this._attempts += 1;
  }

  hasReachedMaxAttempts(maxAttempts: number): boolean {
    return this._attempts >= maxAttempts;
  }

  markConsumed(now: Date): void {
    this._status = OtpStatus.CONSUMED;
    this._consumedAt = now;
  }

  markInvalidated(): void {
    this._status = OtpStatus.INVALIDATED;
  }

  markExpired(): void {
    this._status = OtpStatus.EXPIRED;
  }

  get id(): string {
    return this._id;
  }

  get userId(): string {
    return this._userId;
  }

  get hashedCode(): string {
    return this._hashedCode;
  }

  get attempts(): number {
    return this._attempts;
  }

  get status(): OtpStatus {
    return this._status;
  }

  get expiresAt(): Date {
    return this._expiresAt;
  }

  get consumedAt(): Date | null {
    return this._consumedAt;
  }

  get createdAt(): Date {
    return this._createdAt;
  }
}
