import {
    createMockReservationBlackoutRepository,
    createMockReservationScheduleRepository,
    MockedReservationBlackoutRepository,
    MockedReservationScheduleRepository,
} from '../../__tests__/helpers';
import { BlackoutScope } from '../../domain/enums/blackout-scope.enum';
import { ReservationType } from '../../domain/enums/reservation-type.enum';
import { BlockedDateException } from '../../domain/exceptions/blocked-date.exception';
import { InvalidTimeSlotException } from '../../domain/exceptions/invalid-time-slot.exception';
import { TimeSlotService } from './time-slot.service';

describe('TimeSlotService', () => {
  const ANY_DATE = new Date('2026-10-01T00:00:00.000Z');

  let schedules: MockedReservationScheduleRepository;
  let blackouts: MockedReservationBlackoutRepository;
  let service: TimeSlotService;

  beforeEach(() => {
    schedules = createMockReservationScheduleRepository();
    blackouts = createMockReservationBlackoutRepository();
    blackouts.findByDate.mockResolvedValue(null);
    service = new TimeSlotService(schedules, blackouts);
  });

  describe('TOUR', () => {
    beforeEach(() => {
      schedules.findByType.mockResolvedValue({
        type: ReservationType.TOUR,
        openTime: '10:00',
        closeTime: '18:00',
        intervalMinutes: 120,
        active: true,
      });
    });

    it('accepts a time that lands on a generated slot', async () => {
      await expect(
        service.ensureAvailable(ReservationType.TOUR, ANY_DATE, '12:00'),
      ).resolves.toBeUndefined();
      expect(schedules.findByType).toHaveBeenCalledWith(ReservationType.TOUR);
    });

    it('rejects a time off the interval boundary', async () => {
      await expect(
        service.ensureAvailable(ReservationType.TOUR, ANY_DATE, '11:00'),
      ).rejects.toBeInstanceOf(InvalidTimeSlotException);
    });
  });

  describe('RESTAURANT', () => {
    beforeEach(() => {
      schedules.findByType.mockResolvedValue({
        type: ReservationType.RESTAURANT,
        openTime: '12:00',
        closeTime: '23:00',
        intervalMinutes: 30,
        active: true,
      });
    });

    it.each(['12:00', '12:30', '22:30'])(
      'accepts %s inside the schedule on an interval boundary',
      async (time) => {
        await expect(
          service.ensureAvailable(ReservationType.RESTAURANT, ANY_DATE, time),
        ).resolves.toBeUndefined();
      },
    );

    it('rejects a time before opening', async () => {
      await expect(
        service.ensureAvailable(ReservationType.RESTAURANT, ANY_DATE, '11:30'),
      ).rejects.toBeInstanceOf(InvalidTimeSlotException);
    });

    it('rejects the closing time (exclusive upper bound)', async () => {
      await expect(
        service.ensureAvailable(ReservationType.RESTAURANT, ANY_DATE, '23:00'),
      ).rejects.toBeInstanceOf(InvalidTimeSlotException);
    });

    it('rejects a time off the interval boundary', async () => {
      await expect(
        service.ensureAvailable(ReservationType.RESTAURANT, ANY_DATE, '12:15'),
      ).rejects.toBeInstanceOf(InvalidTimeSlotException);
    });

    it('rejects when the schedule is inactive', async () => {
      schedules.findByType.mockResolvedValue({
        type: ReservationType.RESTAURANT,
        openTime: '12:00',
        closeTime: '23:00',
        intervalMinutes: 30,
        active: false,
      });

      await expect(
        service.ensureAvailable(ReservationType.RESTAURANT, ANY_DATE, '12:00'),
      ).rejects.toBeInstanceOf(InvalidTimeSlotException);
    });

    it('rejects when there is no schedule', async () => {
      schedules.findByType.mockResolvedValue(null);

      await expect(
        service.ensureAvailable(ReservationType.RESTAURANT, ANY_DATE, '12:00'),
      ).rejects.toBeInstanceOf(InvalidTimeSlotException);
    });
  });

  describe('blackout dates', () => {
    it('rejects a booking whose date is blocked for that type', async () => {
      blackouts.findByDate.mockResolvedValue({
        id: 'b1',
        date: ANY_DATE,
        scope: BlackoutScope.RESTAURANT,
        reason: null,
        createdAt: ANY_DATE,
      });

      await expect(
        service.ensureAvailable(ReservationType.RESTAURANT, ANY_DATE, '12:00'),
      ).rejects.toBeInstanceOf(BlockedDateException);
      expect(schedules.findByType).not.toHaveBeenCalled();
    });

    it('rejects any type when the blackout scope is BOTH', async () => {
      blackouts.findByDate.mockResolvedValue({
        id: 'b1',
        date: ANY_DATE,
        scope: BlackoutScope.BOTH,
        reason: null,
        createdAt: ANY_DATE,
      });

      await expect(
        service.ensureAvailable(ReservationType.TOUR, ANY_DATE, '12:00'),
      ).rejects.toBeInstanceOf(BlockedDateException);
    });

    it('ignores a blackout scoped to the other type', async () => {
      blackouts.findByDate.mockResolvedValue({
        id: 'b1',
        date: ANY_DATE,
        scope: BlackoutScope.TOUR,
        reason: null,
        createdAt: ANY_DATE,
      });
      schedules.findByType.mockResolvedValue({
        type: ReservationType.RESTAURANT,
        openTime: '12:00',
        closeTime: '23:00',
        intervalMinutes: 30,
        active: true,
      });

      await expect(
        service.ensureAvailable(ReservationType.RESTAURANT, ANY_DATE, '12:00'),
      ).resolves.toBeUndefined();
    });
  });
});
