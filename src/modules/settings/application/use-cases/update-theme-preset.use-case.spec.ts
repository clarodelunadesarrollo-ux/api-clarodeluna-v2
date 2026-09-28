import { NotFoundException } from '@nestjs/common';

import {
    buildThemePreset,
    createFakeThemePresetRepository,
    FakeThemePresetRepository,
} from './__testing__/theme-preset.fixtures';
import { UpdateThemePresetUseCase } from './update-theme-preset.use-case';

describe('UpdateThemePresetUseCase', () => {
  let presets: FakeThemePresetRepository;
  let useCase: UpdateThemePresetUseCase;

  beforeEach(() => {
    presets = createFakeThemePresetRepository();
    useCase = new UpdateThemePresetUseCase(presets);
  });

  it('merges the provided fields when the preset exists', async () => {
    const existing = buildThemePreset({ key: 'luna_y_olivo' });
    presets.findByKey.mockResolvedValue(existing);
    const updated = buildThemePreset({ key: 'luna_y_olivo', name: 'Renombrada' });
    presets.update.mockResolvedValue(updated);

    const result = await useCase.execute('luna_y_olivo', { name: 'Renombrada' });

    expect(result).toBe(updated);
    expect(presets.update).toHaveBeenCalledWith(
      'luna_y_olivo',
      expect.objectContaining({ name: 'Renombrada' }),
    );
  });

  it('throws when the preset does not exist (404)', async () => {
    presets.findByKey.mockResolvedValue(null);

    await expect(
      useCase.execute('missing_key', { name: 'X' }),
    ).rejects.toBeInstanceOf(NotFoundException);
    expect(presets.update).not.toHaveBeenCalled();
  });
});
