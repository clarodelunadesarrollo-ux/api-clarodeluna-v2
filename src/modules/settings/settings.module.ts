import { Module } from '@nestjs/common';

import { CREATE_THEME_PRESET_USE_CASE } from './application/ports/in/create-theme-preset.port';
import { DELETE_THEME_PRESET_USE_CASE } from './application/ports/in/delete-theme-preset.port';
import { GET_OTP_CHANNEL_SETTING_USE_CASE } from './application/ports/in/get-otp-channel-setting.port';
import { GET_THEME_CONFIGURATION_USE_CASE } from './application/ports/in/get-theme-configuration.port';
import { GET_THEME_PRESETS_USE_CASE } from './application/ports/in/get-theme-presets.port';
import { UPDATE_OTP_CHANNEL_SETTING_USE_CASE } from './application/ports/in/update-otp-channel-setting.port';
import { UPDATE_THEME_CONFIGURATION_USE_CASE } from './application/ports/in/update-theme-configuration.port';
import { UPDATE_THEME_PRESET_USE_CASE } from './application/ports/in/update-theme-preset.port';
import {
    APP_SETTING_REPOSITORY,
    AppSettingRepositoryPort,
} from './application/ports/out/app-setting-repository.port';
import {
    THEME_CONFIGURATION_REPOSITORY,
    ThemeConfigurationRepositoryPort,
} from './application/ports/out/theme-configuration-repository.port';
import {
    THEME_PRESET_REPOSITORY,
    ThemePresetRepositoryPort,
} from './application/ports/out/theme-preset-repository.port';
import { CreateThemePresetUseCase } from './application/use-cases/create-theme-preset.use-case';
import { DeleteThemePresetUseCase } from './application/use-cases/delete-theme-preset.use-case';
import { GetOtpChannelSettingUseCase } from './application/use-cases/get-otp-channel-setting.use-case';
import { GetThemeConfigurationUseCase } from './application/use-cases/get-theme-configuration.use-case';
import { GetThemePresetsUseCase } from './application/use-cases/get-theme-presets.use-case';
import { UpdateOtpChannelSettingUseCase } from './application/use-cases/update-otp-channel-setting.use-case';
import { UpdateThemeConfigurationUseCase } from './application/use-cases/update-theme-configuration.use-case';
import { UpdateThemePresetUseCase } from './application/use-cases/update-theme-preset.use-case';
import { AppSettingPrismaRepository } from './infrastructure/persistence/repositories/app-setting-prisma.repository';
import { ThemeConfigurationPrismaRepository } from './infrastructure/persistence/repositories/theme-configuration-prisma.repository';
import { ThemePresetPrismaRepository } from './infrastructure/persistence/repositories/theme-preset-prisma.repository';
import { SettingsController } from './presentation/controllers/settings.controller';
import { ThemeAdminController } from './presentation/controllers/theme-admin.controller';
import { ThemeController } from './presentation/controllers/theme.controller';

@Module({
  controllers: [SettingsController, ThemeController, ThemeAdminController],
  providers: [
    { provide: APP_SETTING_REPOSITORY, useClass: AppSettingPrismaRepository },
    {
      provide: THEME_CONFIGURATION_REPOSITORY,
      useClass: ThemeConfigurationPrismaRepository,
    },
    {
      provide: THEME_PRESET_REPOSITORY,
      useClass: ThemePresetPrismaRepository,
    },
    {
      provide: GET_OTP_CHANNEL_SETTING_USE_CASE,
      useFactory: (
        settings: AppSettingRepositoryPort,
      ): GetOtpChannelSettingUseCase =>
        new GetOtpChannelSettingUseCase(settings),
      inject: [APP_SETTING_REPOSITORY],
    },
    {
      provide: UPDATE_OTP_CHANNEL_SETTING_USE_CASE,
      useFactory: (
        settings: AppSettingRepositoryPort,
      ): UpdateOtpChannelSettingUseCase =>
        new UpdateOtpChannelSettingUseCase(settings),
      inject: [APP_SETTING_REPOSITORY],
    },
    {
      provide: GET_THEME_CONFIGURATION_USE_CASE,
      useFactory: (
        repository: ThemeConfigurationRepositoryPort,
        presetRepository: ThemePresetRepositoryPort,
      ): GetThemeConfigurationUseCase =>
        new GetThemeConfigurationUseCase(repository, presetRepository),
      inject: [THEME_CONFIGURATION_REPOSITORY, THEME_PRESET_REPOSITORY],
    },
    {
      provide: UPDATE_THEME_CONFIGURATION_USE_CASE,
      useFactory: (
        repository: ThemeConfigurationRepositoryPort,
        presetRepository: ThemePresetRepositoryPort,
      ): UpdateThemeConfigurationUseCase =>
        new UpdateThemeConfigurationUseCase(repository, presetRepository),
      inject: [THEME_CONFIGURATION_REPOSITORY, THEME_PRESET_REPOSITORY],
    },
    {
      provide: GET_THEME_PRESETS_USE_CASE,
      useFactory: (
        presetRepository: ThemePresetRepositoryPort,
      ): GetThemePresetsUseCase =>
        new GetThemePresetsUseCase(presetRepository),
      inject: [THEME_PRESET_REPOSITORY],
    },
    {
      provide: CREATE_THEME_PRESET_USE_CASE,
      useFactory: (
        presetRepository: ThemePresetRepositoryPort,
      ): CreateThemePresetUseCase =>
        new CreateThemePresetUseCase(presetRepository),
      inject: [THEME_PRESET_REPOSITORY],
    },
    {
      provide: UPDATE_THEME_PRESET_USE_CASE,
      useFactory: (
        presetRepository: ThemePresetRepositoryPort,
      ): UpdateThemePresetUseCase =>
        new UpdateThemePresetUseCase(presetRepository),
      inject: [THEME_PRESET_REPOSITORY],
    },
    {
      provide: DELETE_THEME_PRESET_USE_CASE,
      useFactory: (
        presetRepository: ThemePresetRepositoryPort,
        configRepository: ThemeConfigurationRepositoryPort,
      ): DeleteThemePresetUseCase =>
        new DeleteThemePresetUseCase(presetRepository, configRepository),
      inject: [THEME_PRESET_REPOSITORY, THEME_CONFIGURATION_REPOSITORY],
    },
  ],
})
export class SettingsModule {}
