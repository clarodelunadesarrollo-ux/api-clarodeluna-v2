import { PromoCard as PrismaPromoCard } from '@prisma/client';

import { PromoCard } from '../../../domain/entities/promo-card.entity';

export class PromoCardMapper {
  static toDomain(row: PrismaPromoCard): PromoCard {
    return PromoCard.rehydrate({
      id: row.id,
      title: row.title,
      subtitle: row.subtitle,
      imageUrl: row.imageUrl,
      icon: row.icon,
      order: row.order,
      active: row.active,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    });
  }
}
