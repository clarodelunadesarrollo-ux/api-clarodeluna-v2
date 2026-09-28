import { ThemePreset } from '../../domain/theme-configuration';
import { THEME_PRESETS_CATALOG } from '../../domain/theme-presets.catalog';
import { GetThemePresetsPort } from '../ports/in/get-theme-presets.port';
import { ThemePresetRepositoryPort } from '../ports/out/theme-preset-repository.port';

export class GetThemePresetsUseCase implements GetThemePresetsPort {
  constructor(private readonly presetRepository: ThemePresetRepositoryPort) {}

  async execute(): Promise<ThemePreset[]> {
    const presets = await this.presetRepository.findAll();
    // Fallback to the curated catalog if the table has not been seeded yet.
    return presets.length > 0 ? presets : THEME_PRESETS_CATALOG;
  }
}
