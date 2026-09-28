import { MenuSection } from '../../../domain/entities/menu-section.entity';

export const LIST_ALL_MENU_SECTIONS_USE_CASE = Symbol(
  'LIST_ALL_MENU_SECTIONS_USE_CASE',
);

export interface ListAllMenuSectionsUseCasePort {
  execute(): Promise<MenuSection[]>;
}
