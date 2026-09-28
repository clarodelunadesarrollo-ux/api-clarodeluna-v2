import {
    ThemeCustomPalette,
    ThemePreset,
    ThemeSemanticColors,
} from '../../../domain/theme-configuration';

export const THEME_PRESET_REPOSITORY = Symbol('THEME_PRESET_REPOSITORY');

export interface CreateThemePresetData {
  key: string;
  name: string;
  description: string;
  suggestedUse: string;
  sortOrder: number;
  isDefault: boolean;
  palette: ThemeCustomPalette;
  semantic: ThemeSemanticColors;
}

// Partial update: the key is immutable and never part of the payload.
export interface UpdateThemePresetData {
  name?: string;
  description?: string;
  suggestedUse?: string;
  sortOrder?: number;
  palette?: ThemeCustomPalette;
  semantic?: ThemeSemanticColors;
}

export interface ThemePresetRepositoryPort {
  findAll(): Promise<ThemePreset[]>;
  findByKey(key: string): Promise<ThemePreset | null>;
  create(data: CreateThemePresetData): Promise<ThemePreset>;
  update(key: string, data: UpdateThemePresetData): Promise<ThemePreset>;
  delete(key: string): Promise<void>;
}
