import { BogotaClockPort } from '../../../common/time/bogota-clock';
import { ReservationRepositoryPort } from '../../reservations/application/ports/out/reservation-repository.port';
import { Reservation } from '../../reservations/domain/entities/reservation.entity';
import { ReservationStatus } from '../../reservations/domain/enums/reservation-status.enum';
import { ReservationType } from '../../reservations/domain/enums/reservation-type.enum';
import { CheckinConfig } from '../application/config/checkin.config';
import { CheckinCodeGeneratorPort } from '../application/ports/out/checkin-code-generator.port';
import { ValidateArrivalUseCase } from '../application/use-cases/validate-arrival.use-case';
import { CheckinOutsideWindowException } from '../domain/exceptions/checkin-outside-window.exception';
import { InvalidCheckinCodeException } from '../domain/exceptions/invalid-checkin-code.exception';
import { NoEligibleReservationException } from '../domain/exceptions/no-eligible-reservation.exception';

describe('ValidateArrivalUseCase', () => {
  const config: CheckinConfig = {
    venueSecret: 'x'.repeat(32),
    periodSeconds: 3600,
    codeDigits: 4,
  };

  // now = 2026-09-26 18:00:00 UTC == 13:00 Bogota (UTC-5)
  const fixedNow = new Date('2026-09-26T18:00:00.000Z');
  const clock: BogotaClockPort = {
    now: () => fixedNow,
    today: () => new Date(Date.UTC(2026, 8, 26)),
    todayString: () => '2026-09-26',
  };

  const bogotaDay = new Date(Date.UTC(2026, 8, 26));

  function makeReservation(overrides: {
    id?: string;
    time?: string;
    status?: ReservationStatus;
  }): Reservation {
    return Reservation.rehydrate({
      id: overrides.id ?? 'res-1',
      userId: 'user-1',
      type: ReservationType.RESTAURANT,
      date: bogotaDay,
      time: overrides.time ?? '13:00',
      partySize: 2,
      holderName: 'Jane Doe',
      status: overrides.status ?? ReservationStatus.ACTIVE,
      createdAt: new Date('2026-09-20T00:00:00.000Z'),
      updatedAt: new Date('2026-09-20T00:00:00.000Z'),
    });
  }

  function makeRepo(
    overrides: Partial<ReservationRepositoryPort> = {},
  ): ReservationRepositoryPort {
    return {
      create: jest.fn(),
      findById: jest.fn(),
      findByUserId: jest.fn(),
      findAll: jest.fn(),
      countActiveToursFrom: jest.fn(),
      update: jest.fn(),
      updateStatus: jest.fn(),
      delete: jest.fn(),
      ...overrides,
    };
  }

  const validCode = '3893';
  const generator = (): CheckinCodeGeneratorPort => ({
    derive: jest.fn(() => validCode),
  });

  it('marks the nearest eligible reservation as CHECKED_IN', async () => {
    const reservation = makeReservation({ id: 'res-1', time: '13:00' });
    const checkedIn = makeReservation({
      id: 'res-1',
      time: '13:00',
      status: ReservationStatus.CHECKED_IN,
    });
    const updateStatus = jest.fn().mockResolvedValue(checkedIn);
    const repo = makeRepo({
      findByUserId: jest.fn().mockResolvedValue([reservation]),
      updateStatus,
    });
    const codeGenerator = generator();
    const useCase = new ValidateArrivalUseCase(
      repo,
      codeGenerator,
      clock,
      config,
    );

    const result = await useCase.execute({ userId: 'user-1', code: validCode });

    expect(updateStatus).toHaveBeenCalledWith(
      'res-1',
      ReservationStatus.CHECKED_IN,
    );
    expect(result).toBe(checkedIn);
    const expectedCounter = Math.floor(fixedNow.getTime() / 1000 / 3600);
    expect(codeGenerator.derive).toHaveBeenCalledWith(expectedCounter);
  });

  it('rejects an invalid code without changing state', async () => {
    const repo = makeRepo({
      findByUserId: jest.fn().mockResolvedValue([makeReservation({})]),
    });
    const useCase = new ValidateArrivalUseCase(repo, generator(), clock, config);

    await expect(
      useCase.execute({ userId: 'user-1', code: '0000' }),
    ).rejects.toBeInstanceOf(InvalidCheckinCodeException);
    expect(repo.updateStatus).not.toHaveBeenCalled();
  });

  it('rejects a reservation more than 30 minutes ahead of now', async () => {
    // 15:00 Bogota -> 20:00 UTC; window opens 19:30 UTC > now 18:00 UTC
    const repo = makeRepo({
      findByUserId: jest
        .fn()
        .mockResolvedValue([makeReservation({ time: '15:00' })]),
    });
    const useCase = new ValidateArrivalUseCase(repo, generator(), clock, config);

    await expect(
      useCase.execute({ userId: 'user-1', code: validCode }),
    ).rejects.toBeInstanceOf(CheckinOutsideWindowException);
  });

  it('rejects a reservation more than 15 minutes past now', async () => {
    // 12:00 Bogota -> 17:00 UTC; window closes 17:15 UTC < now 18:00 UTC
    const repo = makeRepo({
      findByUserId: jest
        .fn()
        .mockResolvedValue([makeReservation({ time: '12:00' })]),
    });
    const useCase = new ValidateArrivalUseCase(repo, generator(), clock, config);

    await expect(
      useCase.execute({ userId: 'user-1', code: validCode }),
    ).rejects.toBeInstanceOf(CheckinOutsideWindowException);
  });

  it('rejects when the user has no ACTIVE reservation', async () => {
    const repo = makeRepo({
      findByUserId: jest.fn().mockResolvedValue([
        makeReservation({ status: ReservationStatus.CANCELLED }),
        makeReservation({ status: ReservationStatus.CHECKED_IN }),
      ]),
    });
    const useCase = new ValidateArrivalUseCase(repo, generator(), clock, config);

    await expect(
      useCase.execute({ userId: 'user-1', code: validCode }),
    ).rejects.toBeInstanceOf(NoEligibleReservationException);
  });

  it('rejects when the user has no reservations at all', async () => {
    const repo = makeRepo({
      findByUserId: jest.fn().mockResolvedValue([]),
    });
    const useCase = new ValidateArrivalUseCase(repo, generator(), clock, config);

    await expect(
      useCase.execute({ userId: 'user-1', code: validCode }),
    ).rejects.toBeInstanceOf(NoEligibleReservationException);
  });

  it('picks the nearest reservation when several are eligible', async () => {
    const near = makeReservation({ id: 'near', time: '13:00' }); // 18:00 UTC
    const far = makeReservation({ id: 'far', time: '13:10' }); // 18:10 UTC
    const updateStatus = jest.fn().mockResolvedValue(near);
    const repo = makeRepo({
      findByUserId: jest.fn().mockResolvedValue([far, near]),
      updateStatus,
    });
    const useCase = new ValidateArrivalUseCase(repo, generator(), clock, config);

    await useCase.execute({ userId: 'user-1', code: validCode });

    expect(updateStatus).toHaveBeenCalledWith(
      'near',
      ReservationStatus.CHECKED_IN,
    );
  });

  it('accepts a reservation exactly 30 minutes ahead (window open edge)', async () => {
    // 13:30 Bogota -> 18:30 UTC; opens 18:00 UTC == now
    const reservation = makeReservation({ id: 'edge-open', time: '13:30' });
    const updateStatus = jest.fn().mockResolvedValue(reservation);
    const repo = makeRepo({
      findByUserId: jest.fn().mockResolvedValue([reservation]),
      updateStatus,
    });
    const useCase = new ValidateArrivalUseCase(repo, generator(), clock, config);

    await useCase.execute({ userId: 'user-1', code: validCode });

    expect(updateStatus).toHaveBeenCalledWith(
      'edge-open',
      ReservationStatus.CHECKED_IN,
    );
  });

  it('accepts a reservation exactly 15 minutes past (window close edge)', async () => {
    // 12:45 Bogota -> 17:45 UTC; closes 18:00 UTC == now
    const reservation = makeReservation({ id: 'edge-close', time: '12:45' });
    const updateStatus = jest.fn().mockResolvedValue(reservation);
    const repo = makeRepo({
      findByUserId: jest.fn().mockResolvedValue([reservation]),
      updateStatus,
    });
    const useCase = new ValidateArrivalUseCase(repo, generator(), clock, config);

    await useCase.execute({ userId: 'user-1', code: validCode });

    expect(updateStatus).toHaveBeenCalledWith(
      'edge-close',
      ReservationStatus.CHECKED_IN,
    );
  });
});
