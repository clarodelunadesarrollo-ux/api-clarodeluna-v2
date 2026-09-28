import { ThemeConfiguration as PrismaThemeConfiguration } from '@prisma/client';

import { ThemeConfiguration } from '../../../domain/entities/theme-configuration.entity';
import {
    isThemeCustomPalette,
    ThemeCustomPalette,
} from '../../../domain/theme-configuration';

export class ThemeConfigurationMapper {
  static toDomain(row: PrismaThemeConfiguration): ThemeConfiguration {
    return ThemeConfiguration.rehydrate({
      mode: row.mode,
      title: {
        fontFamily: row.titleFontFamily,
        fontWeight: row.titleFontWeight,
      },
      subtitle: {
        fontFamily: row.subtitleFontFamily,
        fontWeight: row.subtitleFontWeight,
      },
      body: {
        fontFamily: row.bodyFontFamily,
        fontWeight: row.bodyFontWeight,
      },
      paletteSource: row.paletteSource,
      presetKey: row.presetKey,
      custom: ThemeConfigurationMapper.toCustomPalette(row),
      updatedAt: row.updatedAt,
    });
  }

  private static toCustomPalette(
    row: PrismaThemeConfiguration,
  ): ThemeCustomPalette | null {
    if (row.paletteSource !== 'CUSTOM') {
      return null;
    }
    return isThemeCustomPalette(row.customPalette) ? row.customPalette : null;
  }
}
