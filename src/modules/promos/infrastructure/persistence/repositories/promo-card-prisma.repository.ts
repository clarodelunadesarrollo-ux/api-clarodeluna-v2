import { Injectable } from '@nestjs/common';

import { PrismaService } from '../../../../../prisma/prisma.service';
import {
    CreatePromoCardData,
    PromoCardRepositoryPort,
    UpdatePromoCardData,
} from '../../../application/ports/out/promo-card-repository.port';
import { PromoCard } from '../../../domain/entities/promo-card.entity';
import { PromoCardMapper } from '../mappers/promo-card.mapper';

@Injectable()
export class PromoCardPrismaRepository implements PromoCardRepositoryPort {
  constructor(private readonly prisma: PrismaService) {}

  async findActiveOrdered(): Promise<PromoCard[]> {
    const rows = await this.prisma.promoCard.findMany({
      where: { active: true },
      orderBy: [{ order: 'asc' }, { createdAt: 'asc' }],
    });
    return rows.map((row) => PromoCardMapper.toDomain(row));
  }

  async findAllOrdered(): Promise<PromoCard[]> {
    const rows = await this.prisma.promoCard.findMany({
      orderBy: [{ order: 'asc' }, { createdAt: 'asc' }],
    });
    return rows.map((row) => PromoCardMapper.toDomain(row));
  }

  async findById(id: string): Promise<PromoCard | null> {
    const row = await this.prisma.promoCard.findUnique({ where: { id } });
    return row ? PromoCardMapper.toDomain(row) : null;
  }

  async create(data: CreatePromoCardData): Promise<PromoCard> {
    const row = await this.prisma.promoCard.create({ data });
    return PromoCardMapper.toDomain(row);
  }

  async update(id: string, data: UpdatePromoCardData): Promise<PromoCard> {
    const row = await this.prisma.promoCard.update({ where: { id }, data });
    return PromoCardMapper.toDomain(row);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.promoCard.delete({ where: { id } });
  }
}
