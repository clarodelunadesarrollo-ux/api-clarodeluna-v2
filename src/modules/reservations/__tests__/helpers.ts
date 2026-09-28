import { BogotaClockPort } from '../../../common/time/bogota-clock';
import { ReservationPolicyConfig } from '../application/config/reservation-policy.config';
import { ReservationBlackoutRepositoryPort } from '../application/ports/out/reservation-blackout-repository.port';
import { ReservationRepositoryPort } from '../application/ports/out/reservation-repository.port';
import { ReservationScheduleRepositoryPort } from '../application/ports/out/reservation-schedule-repository.port';
import { UserLookupPort } from '../application/ports/out/user-lookup.port';
import { Reservation } from '../domain/entities/reservation.entity';
import { ReservationStatus } from '../domain/enums/reservation-status.enum';
import { ReservationType } from '../domain/enums/reservation-type.enum';

/**
 * Typed jest mock factories for the reservations out-ports. Each method is a
 * fresh jest.fn() so tests can stub return values and assert calls in isolation.
 */

export type MockedReservationRepository = {
  [K in keyof ReservationRepositoryPort]: jest.Mock;
};

export function createMockReservationRepository(): MockedReservationRepository {
  return {
    create: jest.fn(),
    findById: jest.fn(),
    findByUserId: jest.fn(),
    findAll: jest.fn(),
    countActiveToursFrom: jest.fn(),
    update: jest.fn(),
    updateStatus: jest.fn(),
    delete: jest.fn(),
  };
}

export type MockedReservationScheduleRepository = {
  [K in keyof ReservationScheduleRepositoryPort]: jest.Mock;
};

export function createMockReservationScheduleRepository(): MockedReservationScheduleRepository {
  return {
    findByType: jest.fn(),
    findAll: jest.fn(),
    upsert: jest.fn(),
  };
}

export type MockedReservationBlackoutRepository = {
  [K in keyof ReservationBlackoutRepositoryPort]: jest.Mock;
};

export function createMockReservationBlackoutRepository(): MockedReservationBlackoutRepository {
  return {
    findAll: jest.fn(),
    findByDate: jest.fn(),
    create: jest.fn(),
    delete: jest.fn(),
  };
}

export type MockedUserLookup = {
  [K in keyof UserLookupPort]: jest.Mock;
};

export function createMockUserLookup(): MockedUserLookup {
  return {
    findById: jest.fn(),
  };
}

export type MockedClock = {
  [K in keyof BogotaClockPort]: jest.Mock;
};

/**
 * Clock frozen to a fixed Bogota "today" (UTC midnight) so the date-window
 * assertions are deterministic regardless of when the suite runs.
 */
export function createMockClock(today: Date): MockedClock {
  return {
    now: jest.fn(() => new Date(today.getTime())),
    today: jest.fn(() => new Date(today.getTime())),
    todayString: jest.fn(() => today.toISOString().slice(0, 10)),
  };
}

export function createPolicy(
  overrides: Partial<ReservationPolicyConfig> = {},
): ReservationPolicyConfig {
  return {
    maxActiveTours: 2,
    dateWindowDays: 30,
    minPartySize: 1,
    maxPartySize: 8,
    ...overrides,
  };
}

/** Builds a domain Reservation for repository stubs (defaults to an owned, ACTIVE tour). */
export function buildReservation(
  overrides: Partial<{
    id: string;
    userId: string;
    type: ReservationType;
    date: Date;
    time: string;
    partySize: number;
    holderName: string;
    status: ReservationStatus;
    createdAt: Date;
    updatedAt: Date;
  }> = {},
): Reservation {
  const base = {
    id: 'res-1',
    userId: 'user-1',
    type: ReservationType.TOUR,
    date: new Date('2026-10-01T00:00:00.000Z'),
    time: '10:00',
    partySize: 2,
    holderName: 'Ada Lovelace',
    status: ReservationStatus.ACTIVE,
    createdAt: new Date('2026-09-26T12:00:00.000Z'),
    updatedAt: new Date('2026-09-26T12:00:00.000Z'),
  };
  return Reservation.rehydrate({ ...base, ...overrides });
}
