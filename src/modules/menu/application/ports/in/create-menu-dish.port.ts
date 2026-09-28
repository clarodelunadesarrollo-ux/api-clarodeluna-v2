import { MenuDish } from '../../../domain/entities/menu-dish.entity';

export const CREATE_MENU_DISH_USE_CASE = Symbol('CREATE_MENU_DISH_USE_CASE');

export interface CreateMenuDishCommand {
  sectionId: string;
  name: string;
  description: string;
  imageUrl: string;
  priceCents?: number | null;
  tags?: string[];
  order: number;
  active?: boolean;
}

export interface CreateMenuDishUseCasePort {
  execute(command: CreateMenuDishCommand): Promise<MenuDish>;
}
