import { PromoCard } from '../../../domain/entities/promo-card.entity';

export const LIST_ALL_PROMOS_USE_CASE = Symbol('LIST_ALL_PROMOS_USE_CASE');

export interface ListAllPromosUseCasePort {
  execute(): Promise<PromoCard[]>;
}
