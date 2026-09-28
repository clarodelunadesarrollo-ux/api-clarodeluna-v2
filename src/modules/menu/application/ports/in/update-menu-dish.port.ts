import { MenuDish } from '../../../domain/entities/menu-dish.entity';

export const UPDATE_MENU_DISH_USE_CASE = Symbol('UPDATE_MENU_DISH_USE_CASE');

export interface UpdateMenuDishCommand {
  name?: string;
  description?: string;
  imageUrl?: string;
  priceCents?: number | null;
  tags?: string[];
  order?: number;
  active?: boolean;
}

export interface UpdateMenuDishUseCasePort {
  execute(id: string, command: UpdateMenuDishCommand): Promise<MenuDish>;
}
