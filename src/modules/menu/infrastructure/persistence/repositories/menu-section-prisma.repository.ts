import { Injectable } from '@nestjs/common';

import { PrismaService } from '../../../../../prisma/prisma.service';
import {
    CreateMenuSectionData,
    MenuSectionRepositoryPort,
    UpdateMenuSectionData,
} from '../../../application/ports/out/menu-section-repository.port';
import { MenuSection } from '../../../domain/entities/menu-section.entity';
import { MenuType } from '../../../domain/enums/menu-type.enum';
import { MenuSectionMapper } from '../mappers/menu-section.mapper';

@Injectable()
export class MenuSectionPrismaRepository implements MenuSectionRepositoryPort {
  constructor(private readonly prisma: PrismaService) {}

  async findActiveByMenuTypeWithDishes(menuType: MenuType): Promise<MenuSection[]> {
    const rows = await this.prisma.menuSection.findMany({
      where: { menuType, active: true },
      orderBy: { order: 'asc' },
      include: {
        dishes: { where: { active: true }, orderBy: { order: 'asc' } },
      },
    });
    return rows.map((row) => MenuSectionMapper.toDomain(row));
  }

  async findAllWithDishes(): Promise<MenuSection[]> {
    const rows = await this.prisma.menuSection.findMany({
      orderBy: [{ menuType: 'asc' }, { order: 'asc' }],
      include: { dishes: { orderBy: { order: 'asc' } } },
    });
    return rows.map((row) => MenuSectionMapper.toDomain(row));
  }

  async findById(id: string): Promise<MenuSection | null> {
    const row = await this.prisma.menuSection.findUnique({
      where: { id },
      include: { dishes: { orderBy: { order: 'asc' } } },
    });
    return row ? MenuSectionMapper.toDomain(row) : null;
  }

  async create(data: CreateMenuSectionData): Promise<MenuSection> {
    const row = await this.prisma.menuSection.create({
      data,
      include: { dishes: { orderBy: { order: 'asc' } } },
    });
    return MenuSectionMapper.toDomain(row);
  }

  async update(id: string, data: UpdateMenuSectionData): Promise<MenuSection> {
    const row = await this.prisma.menuSection.update({
      where: { id },
      data,
      include: { dishes: { orderBy: { order: 'asc' } } },
    });
    return MenuSectionMapper.toDomain(row);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.menuSection.delete({ where: { id } });
  }
}
