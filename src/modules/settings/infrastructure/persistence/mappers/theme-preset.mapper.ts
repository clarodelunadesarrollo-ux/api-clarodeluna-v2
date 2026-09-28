import { ThemePreset as PrismaThemePreset } from '@prisma/client';

import {
    DEFAULT_SEMANTIC_COLORS,
    isThemeCustomPalette,
    isThemeSemanticColors,
    ThemePreset,
} from '../../../domain/theme-configuration';
import { DEFAULT_THEME_PRESET } from '../../../domain/theme-presets.catalog';

export class ThemePresetMapper {
  static toDomain(row: PrismaThemePreset): ThemePreset {
    return {
      key: row.key,
      name: row.name,
      description: row.description,
      suggestedUse: row.suggestedUse,
      sortOrder: row.sortOrder,
      isDefault: row.isDefault,
      palette: isThemeCustomPalette(row.palette)
        ? row.palette
        : DEFAULT_THEME_PRESET.palette,
      semantic: isThemeSemanticColors(row.semantic)
        ? row.semantic
        : DEFAULT_SEMANTIC_COLORS,
    };
  }
}
