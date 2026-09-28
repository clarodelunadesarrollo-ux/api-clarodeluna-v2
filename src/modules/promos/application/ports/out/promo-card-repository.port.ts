import { PromoCard } from '../../../domain/entities/promo-card.entity';

export const PROMO_CARD_REPOSITORY = Symbol('PROMO_CARD_REPOSITORY');

export interface CreatePromoCardData {
  title: string;
  subtitle: string;
  imageUrl: string | null;
  icon: string | null;
  order: number;
  active: boolean;
}

export interface UpdatePromoCardData {
  title?: string;
  subtitle?: string;
  imageUrl?: string | null;
  icon?: string | null;
  order?: number;
  active?: boolean;
}

export interface PromoCardRepositoryPort {
  // Active cards ordered by `order` asc, for the guest app.
  findActiveOrdered(): Promise<PromoCard[]>;
  // All cards (active and inactive) ordered by `order` asc, for the admin.
  findAllOrdered(): Promise<PromoCard[]>;
  findById(id: string): Promise<PromoCard | null>;
  create(data: CreatePromoCardData): Promise<PromoCard>;
  update(id: string, data: UpdatePromoCardData): Promise<PromoCard>;
  delete(id: string): Promise<void>;
}
