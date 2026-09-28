import {
    buildReservation,
    createMockClock,
    createMockReservationRepository,
    createPolicy,
    MockedClock,
    MockedReservationRepository,
} from '../../__tests__/helpers';
import { ReservationStatus } from '../../domain/enums/reservation-status.enum';
import { ReservationType } from '../../domain/enums/reservation-type.enum';
import { InvalidPartySizeException } from '../../domain/exceptions/invalid-party-size.exception';
import { InvalidReservationDateException } from '../../domain/exceptions/invalid-reservation-date.exception';
import { ReservationForbiddenException } from '../../domain/exceptions/reservation-forbidden.exception';
import { ReservationLockedException } from '../../domain/exceptions/reservation-locked.exception';
import { ReservationNotFoundException } from '../../domain/exceptions/reservation-not-found.exception';
import { TimeSlotService } from '../services/time-slot.service';
import { UpdateReservationUseCase } from './update-reservation.use-case';

describe('UpdateReservationUseCase', () => {
  const TODAY = new Date('2026-09-26T00:00:00.000Z');

  let reservations: MockedReservationRepository;
  let clock: MockedClock;
  let timeSlots: { ensureAvailable: jest.Mock };
  let useCase: UpdateReservationUseCase;

  beforeEach(() => {
    reservations = createMockReservationRepository();
    clock = createMockClock(TODAY);
    timeSlots = { ensureAvailable: jest.fn().mockResolvedValue(undefined) };
    useCase = new UpdateReservationUseCase(
      reservations,
      timeSlots as unknown as TimeSlotService,
      clock,
      createPolicy(),
    );
  });

  const command = (overrides = {}) => ({
    userId: 'user-1',
    reservationId: 'res-1',
    ...overrides,
  });

  it('rejects an unknown reservation (404)', async () => {
    reservations.findById.mockResolvedValue(null);

    await expect(
      useCase.execute(command({ partySize: 3 })),
    ).rejects.toBeInstanceOf(ReservationNotFoundException);
  });

  it('rejects a reservation owned by another user (403)', async () => {
    reservations.findById.mockResolvedValue(
      buildReservation({ userId: 'someone-else' }),
    );

    await expect(
      useCase.execute(command({ partySize: 3 })),
    ).rejects.toBeInstanceOf(ReservationForbiddenException);
    expect(reservations.update).not.toHaveBeenCalled();
  });

  it('rejects a frozen (checked-in) reservation (409)', async () => {
    reservations.findById.mockResolvedValue(
      buildReservation({ status: ReservationStatus.CHECKED_IN }),
    );

    await expect(
      useCase.execute(command({ partySize: 3 })),
    ).rejects.toBeInstanceOf(ReservationLockedException);
    expect(reservations.update).not.toHaveBeenCalled();
  });

  it('rejects an out-of-range party size (400)', async () => {
    reservations.findById.mockResolvedValue(buildReservation());

    await expect(
      useCase.execute(command({ partySize: 0 })),
    ).rejects.toBeInstanceOf(InvalidPartySizeException);
  });

  it('rejects a date outside the bookable window (400)', async () => {
    reservations.findById.mockResolvedValue(buildReservation());

    await expect(
      useCase.execute(command({ date: '2027-01-01' })),
    ).rejects.toBeInstanceOf(InvalidReservationDateException);
  });

  it('updates party size only without re-checking the time slot', async () => {
    reservations.findById.mockResolvedValue(buildReservation());
    reservations.update.mockResolvedValue(buildReservation({ partySize: 4 }));

    await useCase.execute(command({ partySize: 4 }));

    expect(timeSlots.ensureAvailable).not.toHaveBeenCalled();
    expect(reservations.update).toHaveBeenCalledWith('res-1', { partySize: 4 });
  });

  it('re-validates the time slot using the existing type when the time changes', async () => {
    reservations.findById.mockResolvedValue(
      buildReservation({ type: ReservationType.TOUR, time: '10:00' }),
    );
    reservations.update.mockResolvedValue(buildReservation({ time: '12:00' }));

    await useCase.execute(command({ time: '12:00' }));

    expect(timeSlots.ensureAvailable).toHaveBeenCalledWith(
      ReservationType.TOUR,
      expect.any(Date),
      '12:00',
    );
    expect(reservations.update).toHaveBeenCalledWith('res-1', { time: '12:00' });
  });
});
