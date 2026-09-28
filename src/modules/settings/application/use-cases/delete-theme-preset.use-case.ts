import { ConflictException, NotFoundException } from '@nestjs/common';

import { DeleteThemePresetPort } from '../ports/in/delete-theme-preset.port';
import { ThemeConfigurationRepositoryPort } from '../ports/out/theme-configuration-repository.port';
import { ThemePresetRepositoryPort } from '../ports/out/theme-preset-repository.port';

export class DeleteThemePresetUseCase implements DeleteThemePresetPort {
  constructor(
    private readonly presetRepository: ThemePresetRepositoryPort,
    private readonly configRepository: ThemeConfigurationRepositoryPort,
  ) {}

  async execute(key: string): Promise<void> {
    const preset = await this.presetRepository.findByKey(key);
    if (preset === null) {
      throw new NotFoundException('El tema solicitado no existe.');
    }

    const config = await this.configRepository.find();
    const activePresetKey = config?.toSnapshot().presetKey ?? null;
    if (activePresetKey === key) {
      throw new ConflictException(
        'No se puede eliminar el tema activo. Activá otro tema antes de eliminarlo.',
      );
    }

    if (preset.isDefault) {
      throw new ConflictException(
        'No se puede eliminar el tema predeterminado.',
      );
    }

    await this.presetRepository.delete(key);
  }
}
