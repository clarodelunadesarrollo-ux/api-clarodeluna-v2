import { PromoCard } from '../../domain/entities/promo-card.entity';

class PromoCardResponseDto {
  readonly id: string;
  readonly title: string;
  readonly subtitle: string;
  readonly imageUrl: string | null;
  readonly icon: string | null;

  constructor(promo: PromoCard) {
    this.id = promo.id;
    this.title = promo.title;
    this.subtitle = promo.subtitle;
    this.imageUrl = promo.imageUrl;
    this.icon = promo.icon;
  }
}

export class PromoResponseDto {
  readonly promos: PromoCardResponseDto[];

  constructor(promos: PromoCard[]) {
    this.promos = promos.map((promo) => new PromoCardResponseDto(promo));
  }
}
