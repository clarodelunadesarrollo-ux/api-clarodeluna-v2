import {
    ThemeCustomPalette,
    ThemePreset,
    ThemeSemanticColors,
} from '../../../domain/theme-configuration';

export const CREATE_THEME_PRESET_USE_CASE = Symbol(
  'CREATE_THEME_PRESET_USE_CASE',
);

export interface CreateThemePresetCommand {
  key: string;
  name: string;
  description: string;
  suggestedUse: string;
  sortOrder: number;
  palette: ThemeCustomPalette;
  semantic: ThemeSemanticColors;
}

export interface CreateThemePresetPort {
  execute(command: CreateThemePresetCommand): Promise<ThemePreset>;
}
