import { PromoCard } from '../../../domain/entities/promo-card.entity';

export const LIST_ACTIVE_PROMOS_USE_CASE = Symbol('LIST_ACTIVE_PROMOS_USE_CASE');

export interface ListActivePromosUseCasePort {
  execute(): Promise<PromoCard[]>;
}
