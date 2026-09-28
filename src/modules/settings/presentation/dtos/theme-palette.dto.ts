import { Type } from 'class-transformer';
import { Matches, ValidateNested } from 'class-validator';

const HEX_COLOR = /^#[0-9a-fA-F]{6}$/;

// A single palette token's light/dark HEX pair. Shared by the theme
// configuration and the preset CRUD DTOs.
export class PaletteTokenColorsDto {
  @Matches(HEX_COLOR)
  readonly light!: string;

  @Matches(HEX_COLOR)
  readonly dark!: string;
}

// Full palette: every semantic token with its light/dark pair. Keep the token
// list in sync with PALETTE_TOKEN_NAMES (domain) and the Flutter catalog.
export class ThemeCustomPaletteDto {
  @ValidateNested()
  @Type(() => PaletteTokenColorsDto)
  readonly background!: PaletteTokenColorsDto;

  @ValidateNested()
  @Type(() => PaletteTokenColorsDto)
  readonly surface!: PaletteTokenColorsDto;

  @ValidateNested()
  @Type(() => PaletteTokenColorsDto)
  readonly card!: PaletteTokenColorsDto;

  @ValidateNested()
  @Type(() => PaletteTokenColorsDto)
  readonly primary!: PaletteTokenColorsDto;

  @ValidateNested()
  @Type(() => PaletteTokenColorsDto)
  readonly primaryHover!: PaletteTokenColorsDto;

  @ValidateNested()
  @Type(() => PaletteTokenColorsDto)
  readonly secondary!: PaletteTokenColorsDto;

  @ValidateNested()
  @Type(() => PaletteTokenColorsDto)
  readonly accent!: PaletteTokenColorsDto;

  @ValidateNested()
  @Type(() => PaletteTokenColorsDto)
  readonly textPrimary!: PaletteTokenColorsDto;

  @ValidateNested()
  @Type(() => PaletteTokenColorsDto)
  readonly textSecondary!: PaletteTokenColorsDto;

  @ValidateNested()
  @Type(() => PaletteTokenColorsDto)
  readonly border!: PaletteTokenColorsDto;
}

// The shared semantic status colors (success/warning/error/info), each with its
// light/dark pair. Keep in sync with SEMANTIC_STATE_NAMES (domain).
export class ThemeSemanticColorsDto {
  @ValidateNested()
  @Type(() => PaletteTokenColorsDto)
  readonly success!: PaletteTokenColorsDto;

  @ValidateNested()
  @Type(() => PaletteTokenColorsDto)
  readonly warning!: PaletteTokenColorsDto;

  @ValidateNested()
  @Type(() => PaletteTokenColorsDto)
  readonly error!: PaletteTokenColorsDto;

  @ValidateNested()
  @Type(() => PaletteTokenColorsDto)
  readonly info!: PaletteTokenColorsDto;
}
