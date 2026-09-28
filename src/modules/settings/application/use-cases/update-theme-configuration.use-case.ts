import { BadRequestException } from '@nestjs/common';

import { ThemeConfigurationData } from '../../domain/theme-configuration';
import { UpdateThemeConfigurationUseCasePort } from '../ports/in/update-theme-configuration.port';
import { ThemeConfigurationRepositoryPort } from '../ports/out/theme-configuration-repository.port';
import {
    ThemePresetRepositoryPort,
} from '../ports/out/theme-preset-repository.port';
import {
    buildThemeConfigurationResult,
    ThemeConfigurationResult,
} from '../results/theme-configuration.result';

export class UpdateThemeConfigurationUseCase
  implements UpdateThemeConfigurationUseCasePort
{
  constructor(
    private readonly repository: ThemeConfigurationRepositoryPort,
    private readonly presetRepository: ThemePresetRepositoryPort,
  ) {}

  async execute(
    data: ThemeConfigurationData,
  ): Promise<ThemeConfigurationResult> {
    let preset = null;
    if (data.paletteSource === 'PRESET') {
      if (!data.presetKey) {
        throw new BadRequestException('presetKey is required for PRESET themes');
      }
      preset = await this.presetRepository.findByKey(data.presetKey);
      if (preset === null) {
        throw new BadRequestException(
          `Theme preset "${data.presetKey}" does not exist`,
        );
      }
    }

    const config = await this.repository.upsert(data);
    return buildThemeConfigurationResult(config.toSnapshot(), preset);
  }
}
