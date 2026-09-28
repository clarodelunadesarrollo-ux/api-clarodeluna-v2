import { THEME_PRESETS_CATALOG } from '../../domain/theme-presets.catalog';
import { ThemePresetRepositoryPort } from '../ports/out/theme-preset-repository.port';
import { GetThemePresetsUseCase } from './get-theme-presets.use-case';

describe('GetThemePresetsUseCase', () => {
  let presetRepository: {
    findAll: jest.Mock;
    findByKey: jest.Mock;
  };
  let useCase: GetThemePresetsUseCase;

  beforeEach(() => {
    presetRepository = {
      findAll: jest.fn(),
      findByKey: jest.fn(),
    };
    useCase = new GetThemePresetsUseCase(
      presetRepository as unknown as ThemePresetRepositoryPort,
    );
  });

  it('returns the presets stored in the catalog', async () => {
    presetRepository.findAll.mockResolvedValue(THEME_PRESETS_CATALOG);

    const result = await useCase.execute();

    expect(result).toHaveLength(THEME_PRESETS_CATALOG.length);
    expect(result[0].key).toBe(THEME_PRESETS_CATALOG[0].key);
  });

  it('falls back to the curated catalog when the table is empty', async () => {
    presetRepository.findAll.mockResolvedValue([]);

    const result = await useCase.execute();

    expect(result).toEqual(THEME_PRESETS_CATALOG);
  });
});
