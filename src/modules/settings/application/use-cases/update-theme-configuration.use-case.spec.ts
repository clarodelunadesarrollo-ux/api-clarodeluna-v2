import { BadRequestException } from '@nestjs/common';

import { ThemeConfiguration } from '../../domain/entities/theme-configuration.entity';
import { ThemeConfigurationData } from '../../domain/theme-configuration';
import { DEFAULT_THEME_PRESET } from '../../domain/theme-presets.catalog';
import { ThemeConfigurationRepositoryPort } from '../ports/out/theme-configuration-repository.port';
import { ThemePresetRepositoryPort } from '../ports/out/theme-preset-repository.port';
import { UpdateThemeConfigurationUseCase } from './update-theme-configuration.use-case';

describe('UpdateThemeConfigurationUseCase', () => {
  let repository: {
    find: jest.Mock;
    upsert: jest.Mock;
  };
  let presetRepository: {
    findAll: jest.Mock;
    findByKey: jest.Mock;
  };
  let useCase: UpdateThemeConfigurationUseCase;

  beforeEach(() => {
    repository = {
      find: jest.fn(),
      upsert: jest.fn(),
    };
    presetRepository = {
      findAll: jest.fn(),
      findByKey: jest.fn(),
    };
    useCase = new UpdateThemeConfigurationUseCase(
      repository as unknown as ThemeConfigurationRepositoryPort,
      presetRepository as unknown as ThemePresetRepositoryPort,
    );
  });

  it('upserts a valid preset configuration and returns the resolved result', async () => {
    const data: ThemeConfigurationData = {
      mode: 'LIGHT',
      title: { fontFamily: 'Poppins', fontWeight: 700 },
      subtitle: { fontFamily: 'Poppins', fontWeight: 500 },
      body: { fontFamily: 'Inter', fontWeight: 400 },
      paletteSource: 'PRESET',
      presetKey: DEFAULT_THEME_PRESET.key,
      custom: null,
    };
    const updatedAt = new Date('2026-02-02T10:00:00.000Z');
    presetRepository.findByKey.mockResolvedValue(DEFAULT_THEME_PRESET);
    repository.upsert.mockResolvedValue(
      ThemeConfiguration.rehydrate({ ...data, updatedAt }),
    );

    const result = await useCase.execute(data);

    expect(presetRepository.findByKey).toHaveBeenCalledWith(
      DEFAULT_THEME_PRESET.key,
    );
    expect(repository.upsert).toHaveBeenCalledWith(data);
    expect(result.mode).toBe('LIGHT');
    expect(result.palette.source).toBe('PRESET');
    expect(result.palette.presetKey).toBe(DEFAULT_THEME_PRESET.key);
    expect(result.palette.tokens).toEqual(DEFAULT_THEME_PRESET.palette);
    expect(result.semantic).toEqual(DEFAULT_THEME_PRESET.semantic);
    expect(result.updatedAt).toBe(updatedAt.toISOString());
  });

  it('rejects a preset configuration referencing an unknown preset', async () => {
    const data: ThemeConfigurationData = {
      mode: 'LIGHT',
      title: { fontFamily: 'Poppins', fontWeight: 700 },
      subtitle: { fontFamily: 'Poppins', fontWeight: 500 },
      body: { fontFamily: 'Inter', fontWeight: 400 },
      paletteSource: 'PRESET',
      presetKey: 'does_not_exist',
      custom: null,
    };
    presetRepository.findByKey.mockResolvedValue(null);

    await expect(useCase.execute(data)).rejects.toBeInstanceOf(
      BadRequestException,
    );
    expect(repository.upsert).not.toHaveBeenCalled();
  });
});
