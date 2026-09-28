import {
    IsArray,
    IsBoolean,
    IsInt,
    IsNotEmpty,
    IsOptional,
    IsString,
    IsUrl,
    Min,
} from 'class-validator';

export class UpdateMenuDishDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  readonly name?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  readonly description?: string;

  @IsOptional()
  @IsUrl()
  readonly imageUrl?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  readonly priceCents?: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @IsNotEmpty({ each: true })
  readonly tags?: string[];

  @IsOptional()
  @IsInt()
  @Min(0)
  readonly order?: number;

  @IsOptional()
  @IsBoolean()
  readonly active?: boolean;
}
