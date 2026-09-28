import {
    ThemeCustomPalette,
    ThemePreset,
    ThemeSemanticColors,
} from '../../domain/theme-configuration';

export class ThemePresetResponseDto {
  readonly key: string;
  readonly name: string;
  readonly description: string;
  readonly suggestedUse: string;
  readonly sortOrder: number;
  readonly isDefault: boolean;
  readonly palette: ThemeCustomPalette;
  readonly semantic: ThemeSemanticColors;

  constructor(preset: ThemePreset) {
    this.key = preset.key;
    this.name = preset.name;
    this.description = preset.description;
    this.suggestedUse = preset.suggestedUse;
    this.sortOrder = preset.sortOrder;
    this.isDefault = preset.isDefault;
    this.palette = preset.palette;
    this.semantic = preset.semantic;
  }

  static fromList(presets: ThemePreset[]): ThemePresetResponseDto[] {
    return presets.map((preset) => new ThemePresetResponseDto(preset));
  }
}
