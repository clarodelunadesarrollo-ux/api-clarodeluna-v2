import { PromoCard } from '../../../domain/entities/promo-card.entity';

export const UPDATE_PROMO_USE_CASE = Symbol('UPDATE_PROMO_USE_CASE');

export interface UpdatePromoCommand {
  title?: string;
  subtitle?: string;
  imageUrl?: string | null;
  icon?: string | null;
  order?: number;
  active?: boolean;
}

export interface UpdatePromoUseCasePort {
  execute(id: string, command: UpdatePromoCommand): Promise<PromoCard>;
}
