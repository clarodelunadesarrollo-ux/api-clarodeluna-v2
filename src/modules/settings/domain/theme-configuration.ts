/**
 * Global theme configuration domain: the curated typography and palette options
 * plus validation helpers. Kept in sync with the Flutter theme layer
 * (frontend `core/theme`), which owns the actual color values of each preset.
 */

// Singleton row id for the theme configuration table.
export const THEME_CONFIGURATION_ID = 'singleton';

export const THEME_MODES = ['LIGHT', 'DARK', 'SYSTEM'] as const;
export type ThemeMode = (typeof THEME_MODES)[number];

export const PALETTE_SOURCES = ['PRESET', 'CUSTOM'] as const;
export type PaletteSource = (typeof PALETTE_SOURCES)[number];

// Curated Google Fonts offered for titles / subtitles / body. Keep in sync with
// the Flutter app's curated font list.
export const CURATED_FONTS = [
  'Playfair Display',
  'Lora',
  'Merriweather',
  'Montserrat',
  'Poppins',
  'Inter',
  'Nunito',
  'Roboto Slab',
] as const;
export type CuratedFont = (typeof CURATED_FONTS)[number];

// Standard font weights (300-900). Kept explicit so the app can map each to a
// concrete FontWeight.
export const ALLOWED_FONT_WEIGHTS = [
  300, 400, 500, 600, 700, 800, 900,
] as const;
export type FontWeightValue = (typeof ALLOWED_FONT_WEIGHTS)[number];

// The default preset key (the "Tierra Botánica" palette, recommended as the
// primary theme). The full catalog of presets lives in the database
// (ThemePreset table); this is only the fallback/seed default.
export const DEFAULT_PRESET_KEY = 'tierra_botanica';

// The semantic color tokens that make up a palette. Every theme (preset or
// custom) is defined by these tokens, each with a light and a dark value. Kept
// in sync with the Flutter theme layer, which maps them to Material's
// ColorScheme and derives the remaining slots (on-colors, containers, etc.).
export const PALETTE_TOKEN_NAMES = [
  'background', // Fondo principal
  'surface', // Fondo secundario / superficies
  'card', // Tarjetas
  'primary', // Primario
  'primaryHover', // Primario hover
  'secondary', // Secundario salvia
  'accent', // Acento tierra
  'textPrimary', // Texto principal
  'textSecondary', // Texto secundario
  'border', // Bordes
] as const;
export type PaletteTokenName = (typeof PALETTE_TOKEN_NAMES)[number];

// Suggested semantic states, shared across themes (success/warning/error/info),
// each with its light and dark value.
export const SEMANTIC_STATE_NAMES = [
  'success',
  'warning',
  'error',
  'info',
] as const;
export type SemanticStateName = (typeof SEMANTIC_STATE_NAMES)[number];

export interface ThemeTypographyStyle {
  fontFamily: string;
  fontWeight: number;
}

// A single token's color pair (both HEX #RRGGBB).
export interface PaletteTokenColors {
  light: string;
  dark: string;
}

// A full custom palette: every semantic token with its light/dark pair.
export type ThemeCustomPalette = Record<PaletteTokenName, PaletteTokenColors>;

// The semantic status colors (success/warning/error/info), each light/dark.
export type ThemeSemanticColors = Record<SemanticStateName, PaletteTokenColors>;

// A predefined palette in the catalog (stored in the ThemePreset table).
export interface ThemePreset {
  key: string;
  name: string;
  description: string;
  suggestedUse: string;
  sortOrder: number;
  isDefault: boolean;
  palette: ThemeCustomPalette;
  semantic: ThemeSemanticColors;
}

// The editable theme configuration (without persistence metadata).
export interface ThemeConfigurationData {
  mode: ThemeMode;
  title: ThemeTypographyStyle;
  subtitle: ThemeTypographyStyle;
  body: ThemeTypographyStyle;
  paletteSource: PaletteSource;
  presetKey: string | null;
  custom: ThemeCustomPalette | null;
}

export interface ThemeConfigurationSnapshot extends ThemeConfigurationData {
  updatedAt: Date;
}

// Default configuration, equivalent to the app's current hardcoded look:
// Playfair Display titles, Inter subtitles/body, "default" palette, and
// system-driven light/dark.
export const DEFAULT_THEME_CONFIGURATION: ThemeConfigurationData = {
  mode: 'SYSTEM',
  title: { fontFamily: 'Playfair Display', fontWeight: 600 },
  subtitle: { fontFamily: 'Inter', fontWeight: 600 },
  body: { fontFamily: 'Inter', fontWeight: 400 },
  paletteSource: 'PRESET',
  presetKey: DEFAULT_PRESET_KEY,
  custom: null,
};

const HEX_COLOR = /^#[0-9a-fA-F]{6}$/;

export function isThemeMode(value: unknown): value is ThemeMode {
  return (
    typeof value === 'string' &&
    (THEME_MODES as readonly string[]).includes(value)
  );
}

export function isPaletteSource(value: unknown): value is PaletteSource {
  return (
    typeof value === 'string' &&
    (PALETTE_SOURCES as readonly string[]).includes(value)
  );
}

export function isCuratedFont(value: unknown): value is CuratedFont {
  return (
    typeof value === 'string' &&
    (CURATED_FONTS as readonly string[]).includes(value)
  );
}

export function isAllowedFontWeight(value: unknown): value is FontWeightValue {
  return (
    typeof value === 'number' &&
    (ALLOWED_FONT_WEIGHTS as readonly number[]).includes(value)
  );
}

export function isThemePresetKey(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

export function isHexColor(value: unknown): value is string {
  return typeof value === 'string' && HEX_COLOR.test(value);
}

export function isPaletteTokenColors(
  value: unknown,
): value is PaletteTokenColors {
  if (typeof value !== 'object' || value === null) {
    return false;
  }
  const pair = value as Record<string, unknown>;
  return isHexColor(pair.light) && isHexColor(pair.dark);
}

export function isThemeCustomPalette(
  value: unknown,
): value is ThemeCustomPalette {
  if (typeof value !== 'object' || value === null) {
    return false;
  }
  const palette = value as Record<string, unknown>;
  return PALETTE_TOKEN_NAMES.every((token) =>
    isPaletteTokenColors(palette[token]),
  );
}

export function isThemeSemanticColors(
  value: unknown,
): value is ThemeSemanticColors {
  if (typeof value !== 'object' || value === null) {
    return false;
  }
  const semantic = value as Record<string, unknown>;
  return SEMANTIC_STATE_NAMES.every((state) =>
    isPaletteTokenColors(semantic[state]),
  );
}

// Suggested semantic states shared by all themes; used as the fallback for
// CUSTOM palettes (which only define the 10 brand tokens).
export const DEFAULT_SEMANTIC_COLORS: ThemeSemanticColors = {
  success: { light: '#2F7D4A', dark: '#73C98A' },
  warning: { light: '#B7791F', dark: '#E5B95B' },
  error: { light: '#B6403A', dark: '#EE827A' },
  info: { light: '#3F7180', dark: '#8FC4D0' },
};
