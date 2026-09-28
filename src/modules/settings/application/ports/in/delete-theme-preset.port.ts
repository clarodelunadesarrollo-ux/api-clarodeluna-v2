export const DELETE_THEME_PRESET_USE_CASE = Symbol(
  'DELETE_THEME_PRESET_USE_CASE',
);

export interface DeleteThemePresetPort {
  execute(key: string): Promise<void>;
}
