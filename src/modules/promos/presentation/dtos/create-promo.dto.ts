import {
    IsBoolean,
    IsInt,
    IsNotEmpty,
    IsOptional,
    IsString,
    IsUrl,
    MaxLength,
    Min,
} from 'class-validator';

export class CreatePromoDto {
  @IsString()
  @IsNotEmpty()
  readonly title!: string;

  @IsString()
  @IsNotEmpty()
  readonly subtitle!: string;

  @IsOptional()
  @IsUrl()
  readonly imageUrl?: string;

  // Short key the guest app maps to a built-in icon (with a fallback), e.g.
  // "local_offer", "restaurant", "wine_bar". Kept free-form on purpose so the
  // backend does not need to know the app's icon catalog.
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(40)
  readonly icon?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  readonly order?: number;

  @IsOptional()
  @IsBoolean()
  readonly active?: boolean;
}
