import { MenuDish } from '../../../domain/entities/menu-dish.entity';

export const MENU_DISH_REPOSITORY = Symbol('MENU_DISH_REPOSITORY');

export interface CreateMenuDishData {
  sectionId: string;
  name: string;
  description: string;
  imageUrl: string;
  priceCents: number | null;
  tags: string[];
  order: number;
  active: boolean;
}

export interface UpdateMenuDishData {
  name?: string;
  description?: string;
  imageUrl?: string;
  priceCents?: number | null;
  tags?: string[];
  order?: number;
  active?: boolean;
}

export interface MenuDishRepositoryPort {
  findById(id: string): Promise<MenuDish | null>;
  create(data: CreateMenuDishData): Promise<MenuDish>;
  update(id: string, data: UpdateMenuDishData): Promise<MenuDish>;
  delete(id: string): Promise<void>;
}
