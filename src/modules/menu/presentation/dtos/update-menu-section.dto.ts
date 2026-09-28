import { IsBoolean, IsEnum, IsInt, IsNotEmpty, IsOptional, IsString, Min } from 'class-validator';

import { MenuType } from '../../domain/enums/menu-type.enum';

export class UpdateMenuSectionDto {
  @IsOptional()
  @IsEnum(MenuType)
  readonly menuType?: MenuType;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  readonly title?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  readonly order?: number;

  @IsOptional()
  @IsBoolean()
  readonly active?: boolean;
}
