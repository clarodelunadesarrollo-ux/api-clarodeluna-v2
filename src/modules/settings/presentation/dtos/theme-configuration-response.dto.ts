import { ThemeConfigurationResult } from '../../application/results/theme-configuration.result';
import {
    PaletteSource,
    ThemeCustomPalette,
    ThemeMode,
    ThemeSemanticColors,
    ThemeTypographyStyle,
} from '../../domain/theme-configuration';

interface ThemeTypographyResponse {
  title: ThemeTypographyStyle;
  subtitle: ThemeTypographyStyle;
  body: ThemeTypographyStyle;
}

interface ThemePaletteResponse {
  source: PaletteSource;
  presetKey: string | null;
  tokens: ThemeCustomPalette;
}

export class ThemeConfigurationResponseDto {
  readonly mode: ThemeMode;
  readonly typography: ThemeTypographyResponse;
  readonly palette: ThemePaletteResponse;
  readonly semantic: ThemeSemanticColors;
  readonly updatedAt: string | null;

  constructor(result: ThemeConfigurationResult) {
    this.mode = result.mode;
    this.typography = result.typography;
    this.palette = result.palette;
    this.semantic = result.semantic;
    this.updatedAt = result.updatedAt;
  }
}
