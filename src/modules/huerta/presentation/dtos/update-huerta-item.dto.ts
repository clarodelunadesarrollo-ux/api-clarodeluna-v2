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

export class UpdateHuertaItemDto {
  @IsOptional()
  @IsEnum(HuertaItemType)
  readonly type?: HuertaItemType;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  readonly title?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  readonly description?: string;

  @IsOptional()
  @IsUrl()
  readonly mediaUrl?: string;

  // Validated as a URL when switching to VIDEO or when a poster is provided;
  // the domain invariant is the final guard (422) regardless of DTO shape.
  @ValidateIf(
    (o: UpdateHuertaItemDto) =>
      o.type === HuertaItemType.VIDEO || o.posterUrl !== undefined,
  )
  @IsUrl()
  readonly posterUrl?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  readonly order?: number;

  @IsOptional()
  @IsBoolean()
  readonly active?: boolean;
}
