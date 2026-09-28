export interface CheckinCodeSnapshot {
  code: string;
  qrPayload: string;
  periodStart: Date;
  periodEnd: Date;
}

/**
 * Immutable value object holding the current venue check-in code and the
 * rotation window it belongs to. `qrPayload` equals `code` by design (the QR
 * simply encodes the same 4-digit value) but is kept as a separate field so
 * the QR encoding can evolve without breaking the manual-entry contract.
 */
export class CheckinCode {
  private constructor(
    private readonly _code: string,
    private readonly _qrPayload: string,
    private readonly _periodStart: Date,
    private readonly _periodEnd: Date,
  ) {}

  static create(snapshot: CheckinCodeSnapshot): CheckinCode {
    return new CheckinCode(
      snapshot.code,
      snapshot.qrPayload,
      snapshot.periodStart,
      snapshot.periodEnd,
    );
  }

  get code(): string {
    return this._code;
  }

  get qrPayload(): string {
    return this._qrPayload;
  }

  get periodStart(): Date {
    return this._periodStart;
  }

  get periodEnd(): Date {
    return this._periodEnd;
  }
}
