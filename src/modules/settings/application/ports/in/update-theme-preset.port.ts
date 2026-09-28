import {
    ThemeCustomPalette,
    ThemePreset,
    ThemeSemanticColors,
} from '../../../domain/theme-configuration';

export const UPDATE_THEME_PRESET_USE_CASE = Symbol(
  'UPDATE_THEME_PRESET_USE_CASE',
);

// The key is immutable and travels in the route, never in the command.
export interface UpdateThemePresetCommand {
  name?: string;
  description?: string;
  suggestedUse?: string;
  sortOrder?: number;
  palette?: ThemeCustomPalette;
  semantic?: ThemeSemanticColors;
}

export interface UpdateThemePresetPort {
  execute(
    key: string,
    command: UpdateThemePresetCommand,
  ): Promise<ThemePreset>;
}
