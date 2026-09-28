import { Type } from 'class-transformer';
import {
    IsInt,
    IsString,
    Matches,
    MaxLength,
    Min,
    ValidateNested,
} from 'class-validator';

import {
    ThemeCustomPaletteDto,
    ThemeSemanticColorsDto,
} from './theme-palette.dto';

// snake_case, starts with a lowercase letter. Immutable once created.
const PRESET_KEY = /^[a-z][a-z0-9_]*$/;

export class CreateThemePresetDto {
  @Matches(PRESET_KEY)
  readonly key!: string;

  @IsString()
  @MaxLength(60)
  readonly name!: string;

  @IsString()
  @MaxLength(280)
  readonly description!: string;

  @IsString()
  @MaxLength(120)
  readonly suggestedUse!: string;

  @IsInt()
  @Min(0)
  readonly sortOrder!: number;

  @ValidateNested()
  @Type(() => ThemeCustomPaletteDto)
  readonly palette!: ThemeCustomPaletteDto;

  @ValidateNested()
  @Type(() => ThemeSemanticColorsDto)
  readonly semantic!: ThemeSemanticColorsDto;
}
