import {
    DEFAULT_SEMANTIC_COLORS,
    PaletteSource,
    ThemeConfigurationData,
    ThemeCustomPalette,
    ThemeMode,
    ThemePreset,
    ThemeSemanticColors,
    ThemeTypographyStyle,
} from '../../domain/theme-configuration';
import { DEFAULT_THEME_PRESET } from '../../domain/theme-presets.catalog';

// The resolved theme the app applies directly: concrete color tokens (light +
// dark) and semantic colors, regardless of whether the source is a preset or a
// custom palette.
export interface ThemeConfigurationResult {
  mode: ThemeMode;
  typography: {
    title: ThemeTypographyStyle;
    subtitle: ThemeTypographyStyle;
    body: ThemeTypographyStyle;
  };
  palette: {
    source: PaletteSource;
    presetKey: string | null;
    tokens: ThemeCustomPalette;
  };
  semantic: ThemeSemanticColors;
  updatedAt: string | null;
}

// Resolves the concrete palette + semantic colors from the active configuration
// and its referenced preset (already fetched, or null when missing/custom).
export function buildThemeConfigurationResult(
  data: ThemeConfigurationData & { updatedAt: Date | null },
  preset: ThemePreset | null,
): ThemeConfigurationResult {
  const isPreset = data.paletteSource === 'PRESET';
  const tokens: ThemeCustomPalette = isPreset
    ? (preset?.palette ?? DEFAULT_THEME_PRESET.palette)
    : (data.custom ?? DEFAULT_THEME_PRESET.palette);
  const semantic: ThemeSemanticColors = isPreset
    ? (preset?.semantic ?? DEFAULT_SEMANTIC_COLORS)
    : DEFAULT_SEMANTIC_COLORS;

  return {
    mode: data.mode,
    typography: {
      title: data.title,
      subtitle: data.subtitle,
      body: data.body,
    },
    palette: {
      source: data.paletteSource,
      presetKey: isPreset ? data.presetKey : null,
      tokens,
    },
    semantic,
    updatedAt: data.updatedAt ? data.updatedAt.toISOString() : null,
  };
}
