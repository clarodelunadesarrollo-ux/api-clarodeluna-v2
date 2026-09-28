import { Type } from 'class-transformer';
import {
    IsInt,
    IsOptional,
    IsString,
    MaxLength,
    Min,
    ValidateNested,
} from 'class-validator';

import {
    ThemeCustomPaletteDto,
    ThemeSemanticColorsDto,
} from './theme-palette.dto';

// The key is immutable and travels in the route, never in the payload. Every
// field is optional so the admin can patch a single attribute at a time.
export class UpdateThemePresetDto {
  @IsOptional()
  @IsString()
  @MaxLength(60)
  readonly name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(280)
  readonly description?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  readonly suggestedUse?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  readonly sortOrder?: number;

  @IsOptional()
  @ValidateNested()
  @Type(() => ThemeCustomPaletteDto)
  readonly palette?: ThemeCustomPaletteDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => ThemeSemanticColorsDto)
  readonly semantic?: ThemeSemanticColorsDto;
}
