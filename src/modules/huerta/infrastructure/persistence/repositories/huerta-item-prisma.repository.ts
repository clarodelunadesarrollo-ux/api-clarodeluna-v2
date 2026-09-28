import { Injectable } from '@nestjs/common';

import { PrismaService } from '../../../../../prisma/prisma.service';
import {
    CreateHuertaItemData,
    HuertaItemRepositoryPort,
    UpdateHuertaItemData,
} from '../../../application/ports/out/huerta-item-repository.port';
import { HuertaItem } from '../../../domain/entities/huerta-item.entity';
import { HuertaItemMapper } from '../mappers/huerta-item.mapper';

@Injectable()
export class HuertaItemPrismaRepository implements HuertaItemRepositoryPort {
  constructor(private readonly prisma: PrismaService) {}

  async findActiveOrdered(): Promise<HuertaItem[]> {
    const rows = await this.prisma.huertaItem.findMany({
      where: { active: true },
      orderBy: { order: 'asc' },
    });
    return rows.map((row) => HuertaItemMapper.toDomain(row));
  }

  async findAllOrdered(): Promise<HuertaItem[]> {
    const rows = await this.prisma.huertaItem.findMany({
      orderBy: { order: 'asc' },
    });
    return rows.map((row) => HuertaItemMapper.toDomain(row));
  }

  async findById(id: string): Promise<HuertaItem | null> {
    const row = await this.prisma.huertaItem.findUnique({ where: { id } });
    return row ? HuertaItemMapper.toDomain(row) : null;
  }

  async create(data: CreateHuertaItemData): Promise<HuertaItem> {
    const row = await this.prisma.huertaItem.create({ data });
    return HuertaItemMapper.toDomain(row);
  }

  async update(id: string, data: UpdateHuertaItemData): Promise<HuertaItem> {
    const row = await this.prisma.huertaItem.update({ where: { id }, data });
    return HuertaItemMapper.toDomain(row);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.huertaItem.delete({ where: { id } });
  }
}
