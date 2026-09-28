import { ConflictException, NotFoundException } from '@nestjs/common';

import {
    buildThemeConfiguration,
    buildThemePreset,
    createFakeThemeConfigurationRepository,
    createFakeThemePresetRepository,
    FakeThemeConfigurationRepository,
    FakeThemePresetRepository,
} from './__testing__/theme-preset.fixtures';
import { DeleteThemePresetUseCase } from './delete-theme-preset.use-case';

describe('DeleteThemePresetUseCase', () => {
  let presets: FakeThemePresetRepository;
  let config: FakeThemeConfigurationRepository;
  let useCase: DeleteThemePresetUseCase;

  beforeEach(() => {
    presets = createFakeThemePresetRepository();
    config = createFakeThemeConfigurationRepository();
    useCase = new DeleteThemePresetUseCase(presets, config);
  });

  it('deletes the preset when it is neither active nor default', async () => {
    presets.findByKey.mockResolvedValue(
      buildThemePreset({ key: 'huerta_viva', isDefault: false }),
    );
    config.find.mockResolvedValue(buildThemeConfiguration('tierra_botanica'));
    presets.delete.mockResolvedValue(undefined);

    await useCase.execute('huerta_viva');

    expect(presets.delete).toHaveBeenCalledWith('huerta_viva');
  });

  it('throws not found when the preset does not exist (404)', async () => {
    presets.findByKey.mockResolvedValue(null);

    await expect(useCase.execute('missing_key')).rejects.toBeInstanceOf(
      NotFoundException,
    );
    expect(presets.delete).not.toHaveBeenCalled();
  });

  it('throws a conflict when the preset is the active one (409)', async () => {
    presets.findByKey.mockResolvedValue(
      buildThemePreset({ key: 'tierra_botanica', isDefault: false }),
    );
    config.find.mockResolvedValue(buildThemeConfiguration('tierra_botanica'));

    await expect(useCase.execute('tierra_botanica')).rejects.toBeInstanceOf(
      ConflictException,
    );
    expect(presets.delete).not.toHaveBeenCalled();
  });

  it('throws a conflict when the preset is the default one (409)', async () => {
    presets.findByKey.mockResolvedValue(
      buildThemePreset({ key: 'tierra_botanica', isDefault: true }),
    );
    config.find.mockResolvedValue(buildThemeConfiguration('luna_y_olivo'));

    await expect(useCase.execute('tierra_botanica')).rejects.toBeInstanceOf(
      ConflictException,
    );
    expect(presets.delete).not.toHaveBeenCalled();
  });
});
