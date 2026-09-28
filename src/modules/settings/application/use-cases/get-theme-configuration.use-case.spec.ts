import { ThemeConfiguration } from '../../domain/entities/theme-configuration.entity';
import { DEFAULT_PRESET_KEY } from '../../domain/theme-configuration';
import { DEFAULT_THEME_PRESET } from '../../domain/theme-presets.catalog';
import { ThemeConfigurationRepositoryPort } from '../ports/out/theme-configuration-repository.port';
import { ThemePresetRepositoryPort } from '../ports/out/theme-preset-repository.port';
import { GetThemeConfigurationUseCase } from './get-theme-configuration.use-case';

describe('GetThemeConfigurationUseCase', () => {
  let repository: {
    find: jest.Mock;
    upsert: jest.Mock;
  };
  let presetRepository: {
    findAll: jest.Mock;
    findByKey: jest.Mock;
  };
  let useCase: GetThemeConfigurationUseCase;

  beforeEach(() => {
    repository = {
      find: jest.fn(),
      upsert: jest.fn(),
    };
    presetRepository = {
      findAll: jest.fn(),
      findByKey: jest.fn(),
    };
    useCase = new GetThemeConfigurationUseCase(
      repository as unknown as ThemeConfigurationRepositoryPort,
      presetRepository as unknown as ThemePresetRepositoryPort,
    );
  });

  it('returns the default configuration resolved to the default preset', async () => {
    repository.find.mockResolvedValue(null);
    presetRepository.findByKey.mockResolvedValue(DEFAULT_THEME_PRESET);

    const result = await useCase.execute();

    expect(result.mode).toBe('SYSTEM');
    expect(result.typography.title).toEqual({
      fontFamily: 'Playfair Display',
      fontWeight: 600,
    });
    expect(result.typography.body).toEqual({
      fontFamily: 'Inter',
      fontWeight: 400,
    });
    expect(result.palette.source).toBe('PRESET');
    expect(result.palette.presetKey).toBe(DEFAULT_PRESET_KEY);
    expect(result.palette.tokens).toEqual(DEFAULT_THEME_PRESET.palette);
    expect(result.semantic).toEqual(DEFAULT_THEME_PRESET.semantic);
    expect(result.updatedAt).toBeNull();
    expect(presetRepository.findByKey).toHaveBeenCalledWith(DEFAULT_PRESET_KEY);
  });

  it('resolves a stored preset configuration to its concrete palette', async () => {
    const updatedAt = new Date('2026-01-01T00:00:00.000Z');
    repository.find.mockResolvedValue(
      ThemeConfiguration.rehydrate({
        mode: 'DARK',
        title: { fontFamily: 'Lora', fontWeight: 700 },
        subtitle: { fontFamily: 'Montserrat', fontWeight: 500 },
        body: { fontFamily: 'Nunito', fontWeight: 400 },
        paletteSource: 'PRESET',
        presetKey: DEFAULT_THEME_PRESET.key,
        custom: null,
        updatedAt,
      }),
    );
    presetRepository.findByKey.mockResolvedValue(DEFAULT_THEME_PRESET);

    const result = await useCase.execute();

    expect(result.mode).toBe('DARK');
    expect(result.typography.subtitle).toEqual({
      fontFamily: 'Montserrat',
      fontWeight: 500,
    });
    expect(result.palette.source).toBe('PRESET');
    expect(result.palette.presetKey).toBe(DEFAULT_THEME_PRESET.key);
    expect(result.palette.tokens).toEqual(DEFAULT_THEME_PRESET.palette);
    expect(result.semantic).toEqual(DEFAULT_THEME_PRESET.semantic);
    expect(result.updatedAt).toBe(updatedAt.toISOString());
  });

  it('returns the custom palette tokens for a CUSTOM configuration', async () => {
    const updatedAt = new Date('2026-01-01T00:00:00.000Z');
    const custom = {
      background: { light: '#F7F3E8', dark: '#101A12' },
      surface: { light: '#EEE8D8', dark: '#1B2A1C' },
      card: { light: '#FFFCF4', dark: '#243625' },
      primary: { light: '#112233', dark: '#8FBA76' },
      primaryHover: { light: '#163E1E', dark: '#B1D398' },
      secondary: { light: '#AABF91', dark: '#607B62' },
      accent: { light: '#B46F45', dark: '#D79B71' },
      textPrimary: { light: '#172018', dark: '#F4F1E7' },
      textSecondary: { light: '#526052', dark: '#C0CABC' },
      border: { light: '#D8D3C2', dark: '#3D503E' },
    };
    repository.find.mockResolvedValue(
      ThemeConfiguration.rehydrate({
        mode: 'DARK',
        title: { fontFamily: 'Lora', fontWeight: 700 },
        subtitle: { fontFamily: 'Montserrat', fontWeight: 500 },
        body: { fontFamily: 'Nunito', fontWeight: 400 },
        paletteSource: 'CUSTOM',
        presetKey: null,
        custom,
        updatedAt,
      }),
    );

    const result = await useCase.execute();

    expect(result.palette.source).toBe('CUSTOM');
    expect(result.palette.presetKey).toBeNull();
    expect(result.palette.tokens.primary.light).toBe('#112233');
    expect(result.palette.tokens.primary.dark).toBe('#8FBA76');
    expect(result.updatedAt).toBe(updatedAt.toISOString());
    expect(presetRepository.findByKey).not.toHaveBeenCalled();
  });
});
