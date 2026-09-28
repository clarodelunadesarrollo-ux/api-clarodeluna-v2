import {
    buildReservation,
    createMockClock,
    createMockReservationRepository,
    createMockUserLookup,
    createPolicy,
    MockedClock,
    MockedReservationRepository,
    MockedUserLookup,
} from '../../__tests__/helpers';
import { ReservationType } from '../../domain/enums/reservation-type.enum';
import { InvalidPartySizeException } from '../../domain/exceptions/invalid-party-size.exception';
import { InvalidReservationDateException } from '../../domain/exceptions/invalid-reservation-date.exception';
import { TourLimitReachedException } from '../../domain/exceptions/tour-limit-reached.exception';
import { TimeSlotService } from '../services/time-slot.service';
import { CreateReservationUseCase } from './create-reservation.use-case';

describe('CreateReservationUseCase', () => {
  const TODAY = new Date('2026-09-26T00:00:00.000Z');
  const VALID_DATE = '2026-10-01';

  let reservations: MockedReservationRepository;
  let users: MockedUserLookup;
  let clock: MockedClock;
  let timeSlots: { ensureAvailable: jest.Mock };
  let useCase: CreateReservationUseCase;

  beforeEach(() => {
    reservations = createMockReservationRepository();
    users = createMockUserLookup();
    clock = createMockClock(TODAY);
    timeSlots = { ensureAvailable: jest.fn().mockResolvedValue(undefined) };
    useCase = new CreateReservationUseCase(
      reservations,
      timeSlots as unknown as TimeSlotService,
      users,
      clock,
      createPolicy(),
    );
  });

  const command = (overrides = {}) => ({
    userId: 'user-1',
    email: 'ada@example.com',
    type: ReservationType.RESTAURANT,
    date: VALID_DATE,
    time: '12:00',
    partySize: 2,
    ...overrides,
  });

  it('creates a RESTAURANT reservation without checking the tour limit', async () => {
    reservations.create.mockResolvedValue(buildReservation());

    await useCase.execute(command());

    expect(reservations.countActiveToursFrom).not.toHaveBeenCalled();
    expect(timeSlots.ensureAvailable).toHaveBeenCalledWith(
      ReservationType.RESTAURANT,
      expect.any(Date),
      '12:00',
    );
    expect(reservations.create).toHaveBeenCalledTimes(1);
  });

  it('freezes the holder name from the user profile when present', async () => {
    users.findById.mockResolvedValue({
      id: 'user-1',
      name: 'Ada Lovelace',
      email: 'ada@example.com',
    });
    reservations.create.mockResolvedValue(buildReservation());

    await useCase.execute(command());

    expect(reservations.create).toHaveBeenCalledWith(
      expect.objectContaining({ holderName: 'Ada Lovelace' }),
    );
  });

  it('falls back to the email as holder name when the user has no name', async () => {
    users.findById.mockResolvedValue({
      id: 'user-1',
      name: '   ',
      email: 'ada@example.com',
    });
    reservations.create.mockResolvedValue(buildReservation());

    await useCase.execute(command());

    expect(reservations.create).toHaveBeenCalledWith(
      expect.objectContaining({ holderName: 'ada@example.com' }),
    );
  });

  it('enforces the active-tour limit (409) when the max is reached', async () => {
    reservations.countActiveToursFrom.mockResolvedValue(2);

    await expect(
      useCase.execute(command({ type: ReservationType.TOUR, time: '10:00' })),
    ).rejects.toBeInstanceOf(TourLimitReachedException);
    expect(reservations.create).not.toHaveBeenCalled();
  });

  it('allows a TOUR when the user is below the active-tour limit', async () => {
    reservations.countActiveToursFrom.mockResolvedValue(1);
    reservations.create.mockResolvedValue(buildReservation());

    await useCase.execute(command({ type: ReservationType.TOUR, time: '10:00' }));

    expect(reservations.create).toHaveBeenCalledTimes(1);
  });

  it('rejects a date outside the bookable window (400)', async () => {
    await expect(
      useCase.execute(command({ date: '2027-01-01' })),
    ).rejects.toBeInstanceOf(InvalidReservationDateException);
    expect(reservations.create).not.toHaveBeenCalled();
  });

  it('rejects a date before today (400)', async () => {
    await expect(
      useCase.execute(command({ date: '2026-09-25' })),
    ).rejects.toBeInstanceOf(InvalidReservationDateException);
  });

  it('rejects an out-of-range party size (400)', async () => {
    await expect(
      useCase.execute(command({ partySize: 9 })),
    ).rejects.toBeInstanceOf(InvalidPartySizeException);
    expect(reservations.create).not.toHaveBeenCalled();
  });
});
