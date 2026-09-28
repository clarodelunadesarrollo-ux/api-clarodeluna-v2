import { MenuSection } from '../../../domain/entities/menu-section.entity';
import { MenuType } from '../../../domain/enums/menu-type.enum';

export const UPDATE_MENU_SECTION_USE_CASE = Symbol('UPDATE_MENU_SECTION_USE_CASE');

export interface UpdateMenuSectionCommand {
  menuType?: MenuType;
  title?: string;
  order?: number;
  active?: boolean;
}

export interface UpdateMenuSectionUseCasePort {
  execute(id: string, command: UpdateMenuSectionCommand): Promise<MenuSection>;
}
