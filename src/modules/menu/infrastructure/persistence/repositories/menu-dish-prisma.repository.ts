import { Injectable } from '@nestjs/common';

import { PrismaService } from '../../../../../prisma/prisma.service';
import {
    CreateMenuDishData,
    MenuDishRepositoryPort,
    UpdateMenuDishData,
} from '../../../application/ports/out/menu-dish-repository.port';
import { MenuDish } from '../../../domain/entities/menu-dish.entity';
import { MenuDishMapper } from '../mappers/menu-dish.mapper';

@Injectable()
export class MenuDishPrismaRepository implements MenuDishRepositoryPort {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<MenuDish | null> {
    const row = await this.prisma.menuDish.findUnique({ where: { id } });
    return row ? MenuDishMapper.toDomain(row) : null;
  }

  async create(data: CreateMenuDishData): Promise<MenuDish> {
    const row = await this.prisma.menuDish.create({ data });
    return MenuDishMapper.toDomain(row);
  }

  async update(id: string, data: UpdateMenuDishData): Promise<MenuDish> {
    const row = await this.prisma.menuDish.update({ where: { id }, data });
    return MenuDishMapper.toDomain(row);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.menuDish.delete({ where: { id } });
  }
}
