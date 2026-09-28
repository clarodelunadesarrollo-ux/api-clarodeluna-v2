import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import {
    BOGOTA_CLOCK,
    BogotaClock,
    BogotaClockPort,
} from '../../common/time/bogota-clock';
import {
    RESERVATION_REPOSITORY,
    ReservationRepositoryPort,
} from '../reservations/application/ports/out/reservation-repository.port';
import { ReservationsModule } from '../reservations/reservations.module';
import {
    CHECKIN_CONFIG,
    CheckinConfig,
} from './application/config/checkin.config';
import { GET_CURRENT_CHECKIN_CODE_USE_CASE } from './application/ports/in/get-current-checkin-code.port';
import { VALIDATE_ARRIVAL_USE_CASE } from './application/ports/in/validate-arrival.port';
import {
    CHECKIN_CODE_GENERATOR,
    CheckinCodeGeneratorPort,
} from './application/ports/out/checkin-code-generator.port';
import { GetCurrentCheckinCodeUseCase } from './application/use-cases/get-current-checkin-code.use-case';
import { ValidateArrivalUseCase } from './application/use-cases/validate-arrival.use-case';
import { HmacCheckinCodeGenerator } from './infrastructure/crypto/hmac-checkin-code-generator';
import { CheckinController } from './presentation/controllers/checkin.controller';

@Module({
  imports: [ReservationsModule],
  controllers: [CheckinController],
  providers: [
    { provide: BOGOTA_CLOCK, useClass: BogotaClock },

    // Configuration derived from the validated environment (with fixed defaults)
    {
      provide: CHECKIN_CONFIG,
      useFactory: (config: ConfigService): CheckinConfig => ({
        venueSecret: config.getOrThrow<string>('CHECKIN_VENUE_SECRET'),
        periodSeconds: Number(
          config.get<string>('CHECKIN_PERIOD_SECONDS', '3600'),
        ),
        codeDigits: Number(config.get<string>('CHECKIN_CODE_DIGITS', '4')),
      }),
      inject: [ConfigService],
    },

    // Outbound port adapter
    {
      provide: CHECKIN_CODE_GENERATOR,
      useFactory: (config: CheckinConfig): CheckinCodeGeneratorPort =>
        new HmacCheckinCodeGenerator(config),
      inject: [CHECKIN_CONFIG],
    },

    // Use case wired via factory injecting port interfaces
    {
      provide: GET_CURRENT_CHECKIN_CODE_USE_CASE,
      useFactory: (
        generator: CheckinCodeGeneratorPort,
        clock: BogotaClockPort,
        config: CheckinConfig,
      ): GetCurrentCheckinCodeUseCase =>
        new GetCurrentCheckinCodeUseCase(generator, clock, config),
      inject: [CHECKIN_CODE_GENERATOR, BOGOTA_CLOCK, CHECKIN_CONFIG],
    },

    // Self check-in (arrival): validates the venue code and marks the nearest
    // eligible reservation as CHECKED_IN. Depends on the reservations repository
    // exported by ReservationsModule (AD-2).
    {
      provide: VALIDATE_ARRIVAL_USE_CASE,
      useFactory: (
        reservations: ReservationRepositoryPort,
        generator: CheckinCodeGeneratorPort,
        clock: BogotaClockPort,
        config: CheckinConfig,
      ): ValidateArrivalUseCase =>
        new ValidateArrivalUseCase(reservations, generator, clock, config),
      inject: [
        RESERVATION_REPOSITORY,
        CHECKIN_CODE_GENERATOR,
        BOGOTA_CLOCK,
        CHECKIN_CONFIG,
      ],
    },
  ],
})
export class CheckinModule {}
