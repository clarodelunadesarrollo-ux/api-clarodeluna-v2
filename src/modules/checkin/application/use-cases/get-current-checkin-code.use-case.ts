import { BogotaClockPort } from '../../../../common/time/bogota-clock';
import { CheckinCode } from '../../domain/entities/checkin-code.entity';
import { CheckinConfig } from '../config/checkin.config';
import { GetCurrentCheckinCodeUseCasePort } from '../ports/in/get-current-checkin-code.port';
import { CheckinCodeGeneratorPort } from '../ports/out/checkin-code-generator.port';

/**
 * Computes the venue check-in code for the current rotation window. The counter
 * is `floor(nowUnixSeconds / periodSeconds)`; because the period is a whole
 * number of hours the window boundary lands on the same instant in UTC and in
 * America/Bogota, so no timezone conversion is needed for the counter itself.
 */
export class GetCurrentCheckinCodeUseCase
  implements GetCurrentCheckinCodeUseCasePort
{
  constructor(
    private readonly generator: CheckinCodeGeneratorPort,
    private readonly clock: BogotaClockPort,
    private readonly config: CheckinConfig,
  ) {}

  execute(): Promise<CheckinCode> {
    const nowSeconds = Math.floor(this.clock.now().getTime() / 1000);
    const counter = Math.floor(nowSeconds / this.config.periodSeconds);
    const code = this.generator.derive(counter);

    const periodStart = new Date(counter * this.config.periodSeconds * 1000);
    const periodEnd = new Date(
      (counter + 1) * this.config.periodSeconds * 1000,
    );

    return Promise.resolve(
      CheckinCode.create({ code, qrPayload: code, periodStart, periodEnd }),
    );
  }
}
