import { PromoCard } from '../../domain/entities/promo-card.entity';
import { ListActivePromosUseCasePort } from '../ports/in/list-active-promos.port';
import { PromoCardRepositoryPort } from '../ports/out/promo-card-repository.port';

export class ListActivePromosUseCase implements ListActivePromosUseCasePort {
  constructor(private readonly promos: PromoCardRepositoryPort) {}

  execute(): Promise<PromoCard[]> {
    return this.promos.findActiveOrdered();
  }
}
