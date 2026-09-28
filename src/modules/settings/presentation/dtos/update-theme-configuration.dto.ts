import { Type } from 'class-transformer';
import {
    IsIn,
    IsInt,
    IsNotEmpty,
    IsString,
    ValidateIf,
    ValidateNested,
} from 'class-validator';

import {
    ALLOWED_FONT_WEIGHTS,
    CURATED_FONTS,
    PALETTE_SOURCES,
    PaletteSource,
    THEME_MODES,
    ThemeMode,
} from '../../domain/theme-configuration';
import { ThemeCustomPaletteDto } from './theme-palette.dto';

class ThemeTypographyDto {
  @IsIn([...CURATED_FONTS])
  readonly fontFamily!: string;

  @IsInt()
  @IsIn([...ALLOWED_FONT_WEIGHTS])
  readonly fontWeight!: number;
}

export class UpdateThemeConfigurationDto {
  @IsIn([...THEME_MODES])
  readonly mode!: ThemeMode;

  @ValidateNested()
  @Type(() => ThemeTypographyDto)
  readonly title!: ThemeTypographyDto;

  @ValidateNested()
  @Type(() => ThemeTypographyDto)
  readonly subtitle!: ThemeTypographyDto;

  @ValidateNested()
  @Type(() => ThemeTypographyDto)
  readonly body!: ThemeTypographyDto;

  @IsIn([...PALETTE_SOURCES])
  readonly paletteSource!: PaletteSource;

  // Required only when the palette comes from a predefined preset. Existence is
  // validated dynamically against the ThemePreset catalog in the use case.
  @ValidateIf((o: UpdateThemeConfigurationDto) => o.paletteSource === 'PRESET')
  @IsString()
  @IsNotEmpty()
  readonly presetKey?: string;

  // Required only when the palette is custom.
  @ValidateIf((o: UpdateThemeConfigurationDto) => o.paletteSource === 'CUSTOM')
  @ValidateNested()
  @Type(() => ThemeCustomPaletteDto)
  readonly custom?: ThemeCustomPaletteDto;
}
