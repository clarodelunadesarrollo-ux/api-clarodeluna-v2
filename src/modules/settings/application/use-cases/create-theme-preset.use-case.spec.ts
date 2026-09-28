import { ConflictException } from '@nestjs/common';

import {
    buildPalette,
    buildSemantic,
    buildThemePreset,
    createFakeThemePresetRepository,
    FakeThemePresetRepository,
} from './__testing__/theme-preset.fixtures';
import { CreateThemePresetUseCase } from './create-theme-preset.use-case';

describe('CreateThemePresetUseCase', () => {
  let presets: FakeThemePresetRepository;
  let useCase: CreateThemePresetUseCase;

  const command = {
    key: 'nueva_paleta',
    name: 'Nueva Paleta',
    description: 'Una paleta nueva.',
    suggestedUse: 'Uso general.',
    sortOrder: 5,
    palette: buildPalette(),
    semantic: buildSemantic(),
  };

  beforeEach(() => {
    presets = createFakeThemePresetRepository();
    useCase = new CreateThemePresetUseCase(presets);
  });

  it('creates the preset when the key is free and forces isDefault to false', async () => {
    presets.findByKey.mockResolvedValue(null);
    const created = buildThemePreset({ key: command.key, isDefault: false });
    presets.create.mockResolvedValue(created);

    const result = await useCase.execute(command);

    expect(result).toBe(created);
    expect(presets.create).toHaveBeenCalledWith(
      expect.objectContaining({ key: command.key, isDefault: false }),
    );
  });

  it('throws a conflict when the key already exists (409)', async () => {
    presets.findByKey.mockResolvedValue(buildThemePreset({ key: command.key }));

    await expect(useCase.execute(command)).rejects.toBeInstanceOf(
      ConflictException,
    );
    expect(presets.create).not.toHaveBeenCalled();
  });
});
