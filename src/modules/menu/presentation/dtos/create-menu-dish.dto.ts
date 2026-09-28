import {
    IsArray,
    IsBoolean,
    IsInt,
    IsNotEmpty,
    IsOptional,
    IsString,
    IsUrl,
    IsUUID,
    Min,
} from 'class-validator';

export class CreateMenuDishDto {
  @IsUUID()
  readonly sectionId!: string;

  @IsString()
  @IsNotEmpty()
  readonly name!: string;

  @IsString()
  @IsNotEmpty()
  readonly description!: string;

  @IsUrl()
  readonly imageUrl!: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  readonly priceCents?: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @IsNotEmpty({ each: true })
  readonly tags?: string[];

  @IsInt()
  @Min(0)
  readonly order!: number;

  @IsOptional()
  @IsBoolean()
  readonly active?: boolean;
}
