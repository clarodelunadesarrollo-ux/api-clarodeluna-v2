import { ReservationBlackoutView } from '../../application/ports/out/reservation-blackout-repository.port';
import { BlackoutScope } from '../../domain/enums/blackout-scope.enum';

export class BlackoutResponseDto {
  readonly id: string;
  readonly date: string;
  readonly scope: BlackoutScope;
  readonly reason: string | null;

  constructor(blackout: ReservationBlackoutView) {
    this.id = blackout.id;
    this.date = blackout.date.toISOString().slice(0, 10);
    this.scope = blackout.scope;
    this.reason = blackout.reason;
  }
}
