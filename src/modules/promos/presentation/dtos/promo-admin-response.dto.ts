import { PromoCard } from '../../domain/entities/promo-card.entity';

export class PromoAdminResponseDto {
  readonly id: string;
  readonly title: string;
  readonly subtitle: string;
  readonly imageUrl: string | null;
  readonly icon: string | null;
  readonly order: number;
  readonly active: boolean;
  readonly createdAt: string;
  readonly updatedAt: string;

  constructor(promo: PromoCard) {
    this.id = promo.id;
    this.title = promo.title;
    this.subtitle = promo.subtitle;
    this.imageUrl = promo.imageUrl;
    this.icon = promo.icon;
    this.order = promo.order;
    this.active = promo.active;
    this.createdAt = promo.createdAt.toISOString();
    this.updatedAt = promo.updatedAt.toISOString();
  }
}
