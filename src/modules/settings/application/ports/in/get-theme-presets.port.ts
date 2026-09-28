import { ThemePreset } from '../../../domain/theme-configuration';

export const GET_THEME_PRESETS_USE_CASE = Symbol('GET_THEME_PRESETS_USE_CASE');

export interface GetThemePresetsPort {
  execute(): Promise<ThemePreset[]>;
}
