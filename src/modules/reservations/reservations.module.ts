import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import {
    BOGOTA_CLOCK,
    BogotaClock,
    BogotaClockPort,
} from '../../common/time/bogota-clock';
import {
    RESERVATION_POLICY_CONFIG,
    ReservationPolicyConfig,
} from './application/config/reservation-policy.config';
import { ADMIN_DELETE_RESERVATION_USE_CASE } from './application/ports/in/admin-delete-reservation.port';
import { ADMIN_LIST_RESERVATIONS_USE_CASE } from './application/ports/in/admin-list-reservations.port';
import { ADMIN_UPDATE_RESERVATION_USE_CASE } from './application/ports/in/admin-update-reservation.port';
import { CANCEL_RESERVATION_USE_CASE } from './application/ports/in/cancel-reservation.port';
import { CREATE_RESERVATION_BLACKOUT_USE_CASE } from './application/ports/in/create-reservation-blackout.port';
import { CREATE_RESERVATION_USE_CASE } from './application/ports/in/create-reservation.port';
import { DELETE_RESERVATION_BLACKOUT_USE_CASE } from './application/ports/in/delete-reservation-blackout.port';
import { GET_RESERVATION_SCHEDULES_USE_CASE } from './application/ports/in/get-reservation-schedules.port';
import { GET_RESERVATION_SLOTS_USE_CASE } from './application/ports/in/get-reservation-slots.port';
import { GET_RESTAURANT_HOURS_USE_CASE } from './application/ports/in/get-restaurant-hours.port';
import { LIST_RESERVATION_BLACKOUTS_USE_CASE } from './application/ports/in/list-reservation-blackouts.port';
import { LIST_RESERVATIONS_USE_CASE } from './application/ports/in/list-reservations.port';
import { UPDATE_RESERVATION_SCHEDULE_USE_CASE } from './application/ports/in/update-reservation-schedule.port';
import { UPDATE_RESERVATION_USE_CASE } from './application/ports/in/update-reservation.port';
import {
    RESERVATION_BLACKOUT_REPOSITORY,
    ReservationBlackoutRepositoryPort,
} from './application/ports/out/reservation-blackout-repository.port';
import {
    RESERVATION_REPOSITORY,
    ReservationRepositoryPort,
} from './application/ports/out/reservation-repository.port';
import {
    RESERVATION_SCHEDULE_REPOSITORY,
    ReservationScheduleRepositoryPort,
} from './application/ports/out/reservation-schedule-repository.port';
import {
    USER_LOOKUP,
    UserLookupPort,
} from './application/ports/out/user-lookup.port';
import {
    TIME_SLOT_SERVICE,
    TimeSlotService,
} from './application/services/time-slot.service';
import { AdminDeleteReservationUseCase } from './application/use-cases/admin-delete-reservation.use-case';
import { AdminListReservationsUseCase } from './application/use-cases/admin-list-reservations.use-case';
import { AdminUpdateReservationUseCase } from './application/use-cases/admin-update-reservation.use-case';
import { CancelReservationUseCase } from './application/use-cases/cancel-reservation.use-case';
import { CreateReservationBlackoutUseCase } from './application/use-cases/create-reservation-blackout.use-case';
import { CreateReservationUseCase } from './application/use-cases/create-reservation.use-case';
import { DeleteReservationBlackoutUseCase } from './application/use-cases/delete-reservation-blackout.use-case';
import { GetReservationSchedulesUseCase } from './application/use-cases/get-reservation-schedules.use-case';
import { GetReservationSlotsUseCase } from './application/use-cases/get-reservation-slots.use-case';
import { GetRestaurantHoursUseCase } from './application/use-cases/get-restaurant-hours.use-case';
import { ListReservationBlackoutsUseCase } from './application/use-cases/list-reservation-blackouts.use-case';
import { ListReservationsUseCase } from './application/use-cases/list-reservations.use-case';
import { UpdateReservationScheduleUseCase } from './application/use-cases/update-reservation-schedule.use-case';
import { UpdateReservationUseCase } from './application/use-cases/update-reservation.use-case';
import { ReservationBlackoutPrismaRepository } from './infrastructure/persistence/repositories/reservation-blackout-prisma.repository';
import { ReservationPrismaRepository } from './infrastructure/persistence/repositories/reservation-prisma.repository';
import { ReservationSchedulePrismaRepository } from './infrastructure/persistence/repositories/reservation-schedule-prisma.repository';
import { UserLookupPrismaAdapter } from './infrastructure/persistence/repositories/user-lookup-prisma.adapter';
import { ReservationAdminController } from './presentation/controllers/reservation-admin.controller';
import { ReservationsController } from './presentation/controllers/reservations.controller';

@Module({
  controllers: [ReservationsController, ReservationAdminController],
  providers: [
    // Outbound port adapters
    { provide: RESERVATION_REPOSITORY, useClass: ReservationPrismaRepository },
    {
      provide: RESERVATION_SCHEDULE_REPOSITORY,
      useClass: ReservationSchedulePrismaRepository,
    },
    {
      provide: RESERVATION_BLACKOUT_REPOSITORY,
      useClass: ReservationBlackoutPrismaRepository,
    },
    { provide: USER_LOOKUP, useClass: UserLookupPrismaAdapter },
    { provide: BOGOTA_CLOCK, useClass: BogotaClock },

    // Configuration derived from validated environment (with fixed defaults)
    {
      provide: RESERVATION_POLICY_CONFIG,
      useFactory: (config: ConfigService): ReservationPolicyConfig => ({
        maxActiveTours: Number(
          config.get<string>('RESERVATION_MAX_ACTIVE_TOURS', '2'),
        ),
        dateWindowDays: Number(
          config.get<string>('RESERVATION_DATE_WINDOW_DAYS', '30'),
        ),
        minPartySize: 1,
        maxPartySize: 8,
      }),
      inject: [ConfigService],
    },

    // Shared domain service
    {
      provide: TIME_SLOT_SERVICE,
      useFactory: (
        schedules: ReservationScheduleRepositoryPort,
        blackouts: ReservationBlackoutRepositoryPort,
      ): TimeSlotService => new TimeSlotService(schedules, blackouts),
      inject: [RESERVATION_SCHEDULE_REPOSITORY, RESERVATION_BLACKOUT_REPOSITORY],
    },

    // Use cases (pure classes) wired via factories injecting port interfaces
    {
      provide: CREATE_RESERVATION_USE_CASE,
      useFactory: (
        reservations: ReservationRepositoryPort,
        timeSlots: TimeSlotService,
        users: UserLookupPort,
        clock: BogotaClockPort,
        policy: ReservationPolicyConfig,
      ): CreateReservationUseCase =>
        new CreateReservationUseCase(
          reservations,
          timeSlots,
          users,
          clock,
          policy,
        ),
      inject: [
        RESERVATION_REPOSITORY,
        TIME_SLOT_SERVICE,
        USER_LOOKUP,
        BOGOTA_CLOCK,
        RESERVATION_POLICY_CONFIG,
      ],
    },
    {
      provide: LIST_RESERVATIONS_USE_CASE,
      useFactory: (
        reservations: ReservationRepositoryPort,
      ): ListReservationsUseCase => new ListReservationsUseCase(reservations),
      inject: [RESERVATION_REPOSITORY],
    },
    {
      provide: UPDATE_RESERVATION_USE_CASE,
      useFactory: (
        reservations: ReservationRepositoryPort,
        timeSlots: TimeSlotService,
        clock: BogotaClockPort,
        policy: ReservationPolicyConfig,
      ): UpdateReservationUseCase =>
        new UpdateReservationUseCase(reservations, timeSlots, clock, policy),
      inject: [
        RESERVATION_REPOSITORY,
        TIME_SLOT_SERVICE,
        BOGOTA_CLOCK,
        RESERVATION_POLICY_CONFIG,
      ],
    },
    {
      provide: CANCEL_RESERVATION_USE_CASE,
      useFactory: (
        reservations: ReservationRepositoryPort,
      ): CancelReservationUseCase => new CancelReservationUseCase(reservations),
      inject: [RESERVATION_REPOSITORY],
    },
    {
      provide: GET_RESERVATION_SLOTS_USE_CASE,
      useFactory: (
        schedules: ReservationScheduleRepositoryPort,
        blackouts: ReservationBlackoutRepositoryPort,
        clock: BogotaClockPort,
        policy: ReservationPolicyConfig,
      ): GetReservationSlotsUseCase =>
        new GetReservationSlotsUseCase(schedules, blackouts, clock, policy),
      inject: [
        RESERVATION_SCHEDULE_REPOSITORY,
        RESERVATION_BLACKOUT_REPOSITORY,
        BOGOTA_CLOCK,
        RESERVATION_POLICY_CONFIG,
      ],
    },
    {
      provide: GET_RESTAURANT_HOURS_USE_CASE,
      useFactory: (
        schedules: ReservationScheduleRepositoryPort,
      ): GetRestaurantHoursUseCase => new GetRestaurantHoursUseCase(schedules),
      inject: [RESERVATION_SCHEDULE_REPOSITORY],
    },

    // Admin scheduling use cases
    {
      provide: GET_RESERVATION_SCHEDULES_USE_CASE,
      useFactory: (
        schedules: ReservationScheduleRepositoryPort,
      ): GetReservationSchedulesUseCase =>
        new GetReservationSchedulesUseCase(schedules),
      inject: [RESERVATION_SCHEDULE_REPOSITORY],
    },
    {
      provide: UPDATE_RESERVATION_SCHEDULE_USE_CASE,
      useFactory: (
        schedules: ReservationScheduleRepositoryPort,
      ): UpdateReservationScheduleUseCase =>
        new UpdateReservationScheduleUseCase(schedules),
      inject: [RESERVATION_SCHEDULE_REPOSITORY],
    },
    {
      provide: LIST_RESERVATION_BLACKOUTS_USE_CASE,
      useFactory: (
        blackouts: ReservationBlackoutRepositoryPort,
      ): ListReservationBlackoutsUseCase =>
        new ListReservationBlackoutsUseCase(blackouts),
      inject: [RESERVATION_BLACKOUT_REPOSITORY],
    },
    {
      provide: CREATE_RESERVATION_BLACKOUT_USE_CASE,
      useFactory: (
        blackouts: ReservationBlackoutRepositoryPort,
      ): CreateReservationBlackoutUseCase =>
        new CreateReservationBlackoutUseCase(blackouts),
      inject: [RESERVATION_BLACKOUT_REPOSITORY],
    },
    {
      provide: DELETE_RESERVATION_BLACKOUT_USE_CASE,
      useFactory: (
        blackouts: ReservationBlackoutRepositoryPort,
      ): DeleteReservationBlackoutUseCase =>
        new DeleteReservationBlackoutUseCase(blackouts),
      inject: [RESERVATION_BLACKOUT_REPOSITORY],
    },

    // Admin reservation management use cases
    {
      provide: ADMIN_LIST_RESERVATIONS_USE_CASE,
      useFactory: (
        reservations: ReservationRepositoryPort,
      ): AdminListReservationsUseCase =>
        new AdminListReservationsUseCase(reservations),
      inject: [RESERVATION_REPOSITORY],
    },
    {
      provide: ADMIN_UPDATE_RESERVATION_USE_CASE,
      useFactory: (
        reservations: ReservationRepositoryPort,
        timeSlots: TimeSlotService,
        clock: BogotaClockPort,
        policy: ReservationPolicyConfig,
      ): AdminUpdateReservationUseCase =>
        new AdminUpdateReservationUseCase(
          reservations,
          timeSlots,
          clock,
          policy,
        ),
      inject: [
        RESERVATION_REPOSITORY,
        TIME_SLOT_SERVICE,
        BOGOTA_CLOCK,
        RESERVATION_POLICY_CONFIG,
      ],
    },
    {
      provide: ADMIN_DELETE_RESERVATION_USE_CASE,
      useFactory: (
        reservations: ReservationRepositoryPort,
      ): AdminDeleteReservationUseCase =>
        new AdminDeleteReservationUseCase(reservations),
      inject: [RESERVATION_REPOSITORY],
    },
  ],
  exports: [RESERVATION_REPOSITORY],
})
export class ReservationsModule {}
