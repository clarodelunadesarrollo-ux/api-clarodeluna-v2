import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';

import {
  JWT_AUTH_CONFIG,
  JwtAuthConfig,
  JwtAuthGuard,
} from './common/auth/jwt-auth.guard';
import { validateEnv } from './config/env.validation';
import { HealthController } from './health/health.controller';
import { AuthModule } from './modules/auth/auth.module';
import { BackupModule } from './modules/backup/backup.module';
import { ChatModule } from './modules/chat/chat.module';
import { CheckinModule } from './modules/checkin/checkin.module';
import { HuertaModule } from './modules/huerta/huerta.module';
import { MenuModule } from './modules/menu/menu.module';
import { ProfileModule } from './modules/profile/profile.module';
import { PromosModule } from './modules/promos/promos.module';
import { ReservationsModule } from './modules/reservations/reservations.module';
import { SettingsModule } from './modules/settings/settings.module';
import { TourModule } from './modules/tour/tour.module';
import { UsersModule } from './modules/users/users.module';
import { VrModule } from './modules/vr/vr.module';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, validate: validateEnv }),
    JwtModule.register({}),
    PrismaModule,
    AuthModule,
    ReservationsModule,
    CheckinModule,
    SettingsModule,
    TourModule,
    MenuModule,
    HuertaModule,
    ChatModule,
    ProfileModule,
    VrModule,
    PromosModule,
    UsersModule,
    BackupModule,
  ],
  controllers: [HealthController],
  providers: [
    {
      provide: JWT_AUTH_CONFIG,
      useFactory: (config: ConfigService): JwtAuthConfig => ({
        accessSecret: config.getOrThrow<string>('JWT_ACCESS_SECRET'),
      }),
      inject: [ConfigService],
    },
    { provide: APP_GUARD, useClass: JwtAuthGuard },
  ],
})
export class AppModule {}
