import {
    IsBoolean,
    IsEnum,
    IsInt,
    IsNotEmpty,
    IsOptional,
    IsString,
    IsUrl,
    Min,
    ValidateIf,
} from 'class-validator';

import { HuertaItemType } from '../../domain/enums/huerta-item-type.enum';

export class CreateHuertaItemDto {
  @IsEnum(HuertaItemType)
  readonly type!: HuertaItemType;

  @IsString()
  @IsNotEmpty()
  readonly title!: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  readonly description?: string;

  @IsUrl()
  readonly mediaUrl!: string;

  // Poster is required and must be a valid URL only for VIDEO items (AD-3).
  @ValidateIf((o: CreateHuertaItemDto) => o.type === HuertaItemType.VIDEO)
  @IsUrl()
  readonly posterUrl?: string;

  @IsInt()
  @Min(0)
  readonly order!: number;

  @IsOptional()
  @IsBoolean()
  readonly active?: boolean;
}
