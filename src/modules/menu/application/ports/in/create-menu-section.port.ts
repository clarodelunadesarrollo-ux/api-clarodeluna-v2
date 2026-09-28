import { MenuSection } from '../../../domain/entities/menu-section.entity';
import { MenuType } from '../../../domain/enums/menu-type.enum';

export const CREATE_MENU_SECTION_USE_CASE = Symbol('CREATE_MENU_SECTION_USE_CASE');

export interface CreateMenuSectionCommand {
  menuType: MenuType;
  title: string;
  order: number;
  active?: boolean;
}

export interface CreateMenuSectionUseCasePort {
  execute(command: CreateMenuSectionCommand): Promise<MenuSection>;
}
