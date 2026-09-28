import { MenuSection } from '../../../domain/entities/menu-section.entity';
import { MenuType } from '../../../domain/enums/menu-type.enum';

export const MENU_SECTION_REPOSITORY = Symbol('MENU_SECTION_REPOSITORY');

export interface CreateMenuSectionData {
  menuType: MenuType;
  title: string;
  order: number;
  active: boolean;
}

export interface UpdateMenuSectionData {
  menuType?: MenuType;
  title?: string;
  order?: number;
  active?: boolean;
}

export interface MenuSectionRepositoryPort {
  // Active sections for a menu type, ordered, each with its active dishes ordered.
  findActiveByMenuTypeWithDishes(menuType: MenuType): Promise<MenuSection[]>;
  // All sections (both menu types, active and inactive) ordered by menu type
  // then position, each with all of its dishes ordered. Admin listing.
  findAllWithDishes(): Promise<MenuSection[]>;
  findById(id: string): Promise<MenuSection | null>;
  create(data: CreateMenuSectionData): Promise<MenuSection>;
  update(id: string, data: UpdateMenuSectionData): Promise<MenuSection>;
  delete(id: string): Promise<void>;
}
