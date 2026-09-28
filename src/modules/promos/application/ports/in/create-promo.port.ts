import { PromoCard } from '../../../domain/entities/promo-card.entity';

export const CREATE_PROMO_USE_CASE = Symbol('CREATE_PROMO_USE_CASE');

export interface CreatePromoCommand {
  title: string;
  subtitle: string;
  imageUrl?: string | null;
  icon?: string | null;
  order?: number;
  active?: boolean;
}

export interface CreatePromoUseCasePort {
  execute(command: CreatePromoCommand): Promise<PromoCard>;
}
