import {
    IsBoolean,
    IsInt,
    IsNotEmpty,
    IsOptional,
    IsString,
    IsUrl,
    MaxLength,
    Min,
    ValidateIf,
} from 'class-validator';

export class UpdatePromoDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  readonly title?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  readonly subtitle?: string;

  // Accepts a URL to set the image, or null to clear it. `undefined` leaves it
  // unchanged (handled in the use case).
  @ValidateIf((o: UpdatePromoDto) => o.imageUrl !== null)
  @IsOptional()
  @IsUrl()
  readonly imageUrl?: string | null;

  // Accepts a short key to set the icon, or null to clear it.
  @ValidateIf((o: UpdatePromoDto) => o.icon !== null)
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(40)
  readonly icon?: string | null;

  @IsOptional()
  @IsInt()
  @Min(0)
  readonly order?: number;

  @IsOptional()
  @IsBoolean()
  readonly active?: boolean;
}
