import { Controller, Get, Inject } from '@nestjs/common';

import { Public } from '../../../../common/decorators/public.decorator';
import {
    GET_THEME_CONFIGURATION_USE_CASE,
    GetThemeConfigurationUseCasePort,
} from '../../application/ports/in/get-theme-configuration.port';
import {
    GET_THEME_PRESETS_USE_CASE,
    GetThemePresetsPort,
} from '../../application/ports/in/get-theme-presets.port';
import { ThemeConfigurationResponseDto } from '../dtos/theme-configuration-response.dto';
import { ThemePresetResponseDto } from '../dtos/theme-preset-response.dto';

// Client surface: the app reads the global theme (colors + typography) at
// startup, before the user authenticates, so the login screen is themed too.
// These reads are public non-sensitive display config; the admin PATCH stays
// protected in ThemeAdminController.
@Controller('settings/theme')
export class ThemeController {
  constructor(
    @Inject(GET_THEME_CONFIGURATION_USE_CASE)
    private readonly getTheme: GetThemeConfigurationUseCasePort,
    @Inject(GET_THEME_PRESETS_USE_CASE)
    private readonly getPresets: GetThemePresetsPort,
  ) {}

  @Public()
  @Get()
  async get(): Promise<ThemeConfigurationResponseDto> {
    const result = await this.getTheme.execute();
    return new ThemeConfigurationResponseDto(result);
  }

  @Public()
  @Get('presets')
  async presets(): Promise<ThemePresetResponseDto[]> {
    const presets = await this.getPresets.execute();
    return ThemePresetResponseDto.fromList(presets);
  }
}
