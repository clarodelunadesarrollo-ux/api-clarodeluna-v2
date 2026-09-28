import { NotFoundException } from '@nestjs/common';

import { ThemePreset } from '../../domain/theme-configuration';
import {
    UpdateThemePresetCommand,
    UpdateThemePresetPort,
} from '../ports/in/update-theme-preset.port';
import { ThemePresetRepositoryPort } from '../ports/out/theme-preset-repository.port';

export class UpdateThemePresetUseCase implements UpdateThemePresetPort {
  constructor(private readonly presetRepository: ThemePresetRepositoryPort) {}

  async execute(
    key: string,
    command: UpdateThemePresetCommand,
  ): Promise<ThemePreset> {
    const existing = await this.presetRepository.findByKey(key);
    if (existing === null) {
      throw new NotFoundException('El tema solicitado no existe.');
    }

    // The key is immutable; only the provided fields are merged.
    return this.presetRepository.update(key, {
      name: command.name,
      description: command.description,
      suggestedUse: command.suggestedUse,
      sortOrder: command.sortOrder,
      palette: command.palette,
      semantic: command.semantic,
    });
  }
}
