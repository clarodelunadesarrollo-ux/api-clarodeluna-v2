import { ThemeConfiguration } from '../../../domain/entities/theme-configuration.entity';
import {
    ThemeCustomPalette,
    ThemePreset,
    ThemeSemanticColors,
} from '../../../domain/theme-configuration';
import { ThemeConfigurationRepositoryPort } from '../../ports/out/theme-configuration-repository.port';
import {
    CreateThemePresetData,
    ThemePresetRepositoryPort,
    UpdateThemePresetData,
} from '../../ports/out/theme-preset-repository.port';

export function buildPalette(): ThemeCustomPalette {
  const pair = (light: string, dark: string) => ({ light, dark });
  return {
    background: pair('#FAF7F0', '#14110D'),
    surface: pair('#F2ECE0', '#1E1A14'),
    card: pair('#FFFFFF', '#26221B'),
    primary: pair('#6B7A4F', '#A7B487'),
    primaryHover: pair('#5A6842', '#93A072'),
    secondary: pair('#8A9A6B', '#B6C296'),
    accent: pair('#B07D48', '#D6A574'),
    textPrimary: pair('#2C2A24', '#EFEAE0'),
    textSecondary: pair('#5C574C', '#B7B0A2'),
    border: pair('#D9D2C4', '#3A352C'),
  };
}

export function buildSemantic(): ThemeSemanticColors {
  const pair = (light: string, dark: string) => ({ light, dark });
  return {
    success: pair('#2F7D4A', '#73C98A'),
    warning: pair('#B7791F', '#E5B95B'),
    error: pair('#B6403A', '#EE827A'),
    info: pair('#3F7180', '#8FC4D0'),
  };
}

export function buildThemePreset(
  overrides: Partial<ThemePreset> = {},
): ThemePreset {
  return {
    key: overrides.key ?? 'tierra_botanica',
    name: overrides.name ?? 'Tierra Botánica',
    description: overrides.description ?? 'Paleta cálida inspirada en la huerta.',
    suggestedUse: overrides.suggestedUse ?? 'Tema principal recomendado.',
    sortOrder: overrides.sortOrder ?? 1,
    isDefault: overrides.isDefault ?? false,
    palette: overrides.palette ?? buildPalette(),
    semantic: overrides.semantic ?? buildSemantic(),
  };
}

export function buildThemeConfiguration(presetKey: string): ThemeConfiguration {
  return ThemeConfiguration.rehydrate({
    mode: 'SYSTEM',
    title: { fontFamily: 'Playfair Display', fontWeight: 600 },
    subtitle: { fontFamily: 'Inter', fontWeight: 600 },
    body: { fontFamily: 'Inter', fontWeight: 400 },
    paletteSource: 'PRESET',
    presetKey,
    custom: null,
    updatedAt: new Date('2024-01-01T00:00:00.000Z'),
  });
}

export interface FakeThemePresetRepository extends ThemePresetRepositoryPort {
  findAll: jest.Mock<Promise<ThemePreset[]>, []>;
  findByKey: jest.Mock<Promise<ThemePreset | null>, [string]>;
  create: jest.Mock<Promise<ThemePreset>, [CreateThemePresetData]>;
  update: jest.Mock<Promise<ThemePreset>, [string, UpdateThemePresetData]>;
  delete: jest.Mock<Promise<void>, [string]>;
}

export function createFakeThemePresetRepository(): FakeThemePresetRepository {
  return {
    findAll: jest.fn(),
    findByKey: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };
}

export interface FakeThemeConfigurationRepository
  extends ThemeConfigurationRepositoryPort {
  find: jest.Mock<Promise<ThemeConfiguration | null>, []>;
  upsert: jest.Mock<Promise<ThemeConfiguration>, [unknown]>;
}

export function createFakeThemeConfigurationRepository(): FakeThemeConfigurationRepository {
  return {
    find: jest.fn(),
    upsert: jest.fn(),
  };
}
