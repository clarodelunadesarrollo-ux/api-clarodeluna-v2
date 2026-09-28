import {
    MenuDish as PrismaMenuDish,
    MenuSection as PrismaMenuSection,
} from '@prisma/client';

import { MenuSection } from '../../../domain/entities/menu-section.entity';
import { MenuType } from '../../../domain/enums/menu-type.enum';
import { MenuDishMapper } from './menu-dish.mapper';

type PrismaMenuSectionWithDishes = PrismaMenuSection & {
  dishes: PrismaMenuDish[];
};

export class MenuSectionMapper {
  static toDomain(row: PrismaMenuSectionWithDishes): MenuSection {
    return MenuSection.rehydrate({
      id: row.id,
      menuType: row.menuType as MenuType,
      title: row.title,
      order: row.order,
      active: row.active,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      dishes: row.dishes.map((dish) => MenuDishMapper.toDomain(dish)),
    });
  }
}
