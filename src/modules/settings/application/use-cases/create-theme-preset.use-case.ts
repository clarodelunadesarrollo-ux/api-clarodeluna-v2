import { ConflictException } from '@nestjs/common';

import { ThemePreset } from '../../domain/theme-configuration';
import {
    CreateThemePresetCommand,
    CreateThemePresetPort,
} from '../ports/in/create-theme-preset.port';
import { ThemePresetRepositoryPort } from '../ports/out/theme-preset-repository.port';

export class CreateThemePresetUseCase implements CreateThemePresetPort {
  constructor(private readonly presetRepository: ThemePresetRepositoryPort) {}

  async execute(command: CreateThemePresetCommand): Promise<ThemePreset> {
    const existing = await this.presetRepository.findByKey(command.key);
    if (existing !== null) {
      throw new ConflictException('Ya existe un tema con esa clave.');
    }

    // A newly created preset is never the default one.
    return this.presetRepository.create({
      key: command.key,
      name: command.name,
      description: command.description,
      suggestedUse: command.suggestedUse,
      sortOrder: command.sortOrder,
      isDefault: false,
      palette: command.palette,
      semantic: command.semantic,
    });
  }
}
