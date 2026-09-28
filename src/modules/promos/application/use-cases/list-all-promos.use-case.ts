import { PromoCard } from '../../domain/entities/promo-card.entity';
import { ListAllPromosUseCasePort } from '../ports/in/list-all-promos.port';
import { PromoCardRepositoryPort } from '../ports/out/promo-card-repository.port';

export class ListAllPromosUseCase implements ListAllPromosUseCasePort {
  constructor(private readonly promos: PromoCardRepositoryPort) {}

  execute(): Promise<PromoCard[]> {
    return this.promos.findAllOrdered();
  }
}
