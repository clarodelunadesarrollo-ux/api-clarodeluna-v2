import { DEFAULT_THEME_CONFIGURATION } from '../../domain/theme-configuration';
import { GetThemeConfigurationUseCasePort } from '../ports/in/get-theme-configuration.port';
import { ThemeConfigurationRepositoryPort } from '../ports/out/theme-configuration-repository.port';
import { ThemePresetRepositoryPort } from '../ports/out/theme-preset-repository.port';
import {
    buildThemeConfigurationResult,
    ThemeConfigurationResult,
} from '../results/theme-configuration.result';

export class GetThemeConfigurationUseCase
  implements GetThemeConfigurationUseCasePort
{
  constructor(
    private readonly repository: ThemeConfigurationRepositoryPort,
    private readonly presetRepository: ThemePresetRepositoryPort,
  ) {}

  async execute(): Promise<ThemeConfigurationResult> {
    const config = await this.repository.find();
    const data = config
      ? config.toSnapshot()
      : { ...DEFAULT_THEME_CONFIGURATION, updatedAt: null };

    const preset =
      data.paletteSource === 'PRESET' && data.presetKey
        ? await this.presetRepository.findByKey(data.presetKey)
        : null;

    return buildThemeConfigurationResult(data, preset);
  }
}
