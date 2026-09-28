import { IsBoolean, IsEnum, IsInt, IsNotEmpty, IsOptional, IsString, Min } from 'class-validator';

import { MenuType } from '../../domain/enums/menu-type.enum';

export class CreateMenuSectionDto {
  @IsEnum(MenuType)
  readonly menuType!: MenuType;

  @IsString()
  @IsNotEmpty()
  readonly title!: string;

  @IsInt()
  @Min(0)
  readonly order!: number;

  @IsOptional()
  @IsBoolean()
  readonly active?: boolean;
}
