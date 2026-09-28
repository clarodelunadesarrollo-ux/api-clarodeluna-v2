import {
    createMockReservationScheduleRepository,
    MockedReservationScheduleRepository,
} from '../../__tests__/helpers';
import { ReservationType } from '../../domain/enums/reservation-type.enum';
import { InvalidScheduleException } from '../../domain/exceptions/invalid-schedule.exception';
import { UpdateReservationScheduleUseCase } from './update-reservation-schedule.use-case';

describe('UpdateReservationScheduleUseCase', () => {
  let schedules: MockedReservationScheduleRepository;
  let useCase: UpdateReservationScheduleUseCase;

  beforeEach(() => {
    schedules = createMockReservationScheduleRepository();
    useCase = new UpdateReservationScheduleUseCase(schedules);
  });

  it('validates and upserts a valid schedule', async () => {
    const view = {
      type: ReservationType.RESTAURANT,
      openTime: '12:00',
      closeTime: '23:00',
      intervalMinutes: 30,
      active: true,
    };
    schedules.upsert.mockResolvedValue(view);

    await expect(
      useCase.execute({
        type: ReservationType.RESTAURANT,
        openTime: '12:00',
        closeTime: '23:00',
        intervalMinutes: 30,
        active: true,
      }),
    ).resolves.toEqual(view);
    expect(schedules.upsert).toHaveBeenCalledWith(ReservationType.RESTAURANT, {
      openTime: '12:00',
      closeTime: '23:00',
      intervalMinutes: 30,
      active: true,
    });
  });

  it('rejects an invalid schedule before persisting', async () => {
    await expect(
      useCase.execute({
        type: ReservationType.TOUR,
        openTime: '18:00',
        closeTime: '10:00',
        intervalMinutes: 30,
        active: true,
      }),
    ).rejects.toBeInstanceOf(InvalidScheduleException);
    expect(schedules.upsert).not.toHaveBeenCalled();
  });
});
