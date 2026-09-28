import { BogotaClockPort } from '../../../common/time/bogota-clock';
import { CheckinConfig } from '../application/config/checkin.config';
import { CheckinCodeGeneratorPort } from '../application/ports/out/checkin-code-generator.port';
import { GetCurrentCheckinCodeUseCase } from '../application/use-cases/get-current-checkin-code.use-case';

describe('GetCurrentCheckinCodeUseCase', () => {
  const config: CheckinConfig = {
    venueSecret: 'x'.repeat(32),
    periodSeconds: 3600,
    codeDigits: 4,
  };

  const fixedNow = new Date('2026-09-26T14:12:07.482Z');
  const fakeClock: BogotaClockPort = {
    now: () => fixedNow,
    today: () => new Date('2026-09-26T00:00:00.000Z'),
    todayString: () => '2026-09-26',
  };

  function makeGenerator(derive: jest.Mock): CheckinCodeGeneratorPort {
    return { derive };
  }

  it('computes the current hourly code and aligned period boundaries', async () => {
    const useCase = new GetCurrentCheckinCodeUseCase(
      makeGenerator(jest.fn(() => '3893')),
      fakeClock,
      config,
    );

    const result = await useCase.execute();

    expect(result.code).toBe('3893');
    expect(result.qrPayload).toBe('3893');
    expect(result.periodStart.toISOString()).toBe('2026-09-26T14:00:00.000Z');
    expect(result.periodEnd.toISOString()).toBe('2026-09-26T15:00:00.000Z');
  });

  it('passes the hour counter to the generator', async () => {
    const derive = jest.fn(() => '0001');
    const useCase = new GetCurrentCheckinCodeUseCase(
      makeGenerator(derive),
      fakeClock,
      config,
    );

    await useCase.execute();

    const expectedCounter = Math.floor(fixedNow.getTime() / 1000 / 3600);
    expect(derive).toHaveBeenCalledWith(expectedCounter);
  });
});
