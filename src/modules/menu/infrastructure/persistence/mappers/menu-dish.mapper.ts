import { MenuDish as PrismaMenuDish } from '@prisma/client';

import { MenuDish } from '../../../domain/entities/menu-dish.entity';

export class MenuDishMapper {
  static toDomain(row: PrismaMenuDish): MenuDish {
    return MenuDish.rehydrate({
      id: row.id,
      sectionId: row.sectionId,
      name: row.name,
      description: row.description,
      imageUrl: row.imageUrl,
      priceCents: row.priceCents,
      tags: row.tags,
      order: row.order,
      active: row.active,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    });
  }
}
