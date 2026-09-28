import { CheckinCode } from '../../domain/entities/checkin-code.entity';

/**
 * `data` payload for the check-in endpoint. Field names are the exact camelCase
 * keys the Flutter client parses. Timestamps are ISO 8601 in UTC.
 */
export class CheckinCodeResponseDto {
  readonly code: string;
  readonly qrPayload: string;
  readonly periodStart: string;
  readonly periodEnd: string;

  constructor(checkinCode: CheckinCode) {
    this.code = checkinCode.code;
    this.qrPayload = checkinCode.qrPayload;
    this.periodStart = checkinCode.periodStart.toISOString();
    this.periodEnd = checkinCode.periodEnd.toISOString();
  }
}
