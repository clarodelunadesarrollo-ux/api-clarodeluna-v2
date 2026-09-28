import { MenuSection } from '../../../domain/entities/menu-section.entity';
import { MenuType } from '../../../domain/enums/menu-type.enum';

export const GET_MENU_USE_CASE = Symbol('GET_MENU_USE_CASE');

export interface MenuView {
  menuType: MenuType;
  sections: MenuSection[];
}

export interface GetMenuUseCasePort {
  execute(userId: string): Promise<MenuView>;
}
