import {
    Body,
    Controller,
    Delete,
    HttpCode,
    HttpStatus,
    Inject,
    Param,
    Patch,
    Post,
    UseGuards,
} from '@nestjs/common';

import { RolesGuard } from '../../../../common/auth/roles.guard';
import { UserRole } from '../../../../common/auth/user-role.enum';
import { Roles } from '../../../../common/decorators/roles.decorator';
import {
    CREATE_THEME_PRESET_USE_CASE,
    CreateThemePresetPort,
} from '../../application/ports/in/create-theme-preset.port';
import {
    DELETE_THEME_PRESET_USE_CASE,
    DeleteThemePresetPort,
} from '../../application/ports/in/delete-theme-preset.port';
import {
    UPDATE_THEME_CONFIGURATION_USE_CASE,
    UpdateThemeConfigurationUseCasePort,
} from '../../application/ports/in/update-theme-configuration.port';
import {
    UPDATE_THEME_PRESET_USE_CASE,
    UpdateThemePresetPort,
} from '../../application/ports/in/update-theme-preset.port';
import { ThemeConfigurationData } from '../../domain/theme-configuration';
import { CreateThemePresetDto } from '../dtos/create-theme-preset.dto';
import { ThemeConfigurationResponseDto } from '../dtos/theme-configuration-response.dto';
import { ThemePresetResponseDto } from '../dtos/theme-preset-response.dto';
import { UpdateThemeConfigurationDto } from '../dtos/update-theme-configuration.dto';
import { UpdateThemePresetDto } from '../dtos/update-theme-preset.dto';

// Admin surface for the global theme configuration. Protected by the global
// JwtAuthGuard AND role-restricted to ADMIN via RolesGuard + @Roles.
@Controller('settings/theme')
@UseGuards(RolesGuard)
@Roles(UserRole.ADMIN)
export class ThemeAdminController {
  constructor(
    @Inject(UPDATE_THEME_CONFIGURATION_USE_CASE)
    private readonly updateTheme: UpdateThemeConfigurationUseCasePort,
    @Inject(CREATE_THEME_PRESET_USE_CASE)
    private readonly createPreset: CreateThemePresetPort,
    @Inject(UPDATE_THEME_PRESET_USE_CASE)
    private readonly updatePreset: UpdateThemePresetPort,
    @Inject(DELETE_THEME_PRESET_USE_CASE)
    private readonly deletePreset: DeleteThemePresetPort,
  ) {}

  @Patch()
  async update(
    @Body() dto: UpdateThemeConfigurationDto,
  ): Promise<ThemeConfigurationResponseDto> {
    const result = await this.updateTheme.execute(this.toData(dto));
    return new ThemeConfigurationResponseDto(result);
  }

  @Post('presets')
  async createThemePreset(
    @Body() dto: CreateThemePresetDto,
  ): Promise<ThemePresetResponseDto> {
    const preset = await this.createPreset.execute({
      key: dto.key,
      name: dto.name,
      description: dto.description,
      suggestedUse: dto.suggestedUse,
      sortOrder: dto.sortOrder,
      palette: { ...dto.palette },
      semantic: { ...dto.semantic },
    });
    return new ThemePresetResponseDto(preset);
  }

  @Patch('presets/:key')
  async updateThemePreset(
    @Param('key') key: string,
    @Body() dto: UpdateThemePresetDto,
  ): Promise<ThemePresetResponseDto> {
    const preset = await this.updatePreset.execute(key, {
      name: dto.name,
      description: dto.description,
      suggestedUse: dto.suggestedUse,
      sortOrder: dto.sortOrder,
      palette: dto.palette ? { ...dto.palette } : undefined,
      semantic: dto.semantic ? { ...dto.semantic } : undefined,
    });
    return new ThemePresetResponseDto(preset);
  }

  @Delete('presets/:key')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteThemePreset(@Param('key') key: string): Promise<void> {
    await this.deletePreset.execute(key);
  }

  private toData(dto: UpdateThemeConfigurationDto): ThemeConfigurationData {
    const isCustom = dto.paletteSource === 'CUSTOM';
    return {
      mode: dto.mode,
      title: dto.title,
      subtitle: dto.subtitle,
      body: dto.body,
      paletteSource: dto.paletteSource,
      presetKey: dto.paletteSource === 'PRESET' ? (dto.presetKey ?? null) : null,
      custom: isCustom && dto.custom ? { ...dto.custom } : null,
    };
  }
}
