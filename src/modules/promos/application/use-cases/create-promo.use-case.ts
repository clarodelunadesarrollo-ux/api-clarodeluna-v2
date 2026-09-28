import { PromoCard } from '../../domain/entities/promo-card.entity';
import {
    CreatePromoCommand,
    CreatePromoUseCasePort,
} from '../ports/in/create-promo.port';
import { PromoCardRepositoryPort } from '../ports/out/promo-card-repository.port';

export class CreatePromoUseCase implements CreatePromoUseCasePort {
  constructor(private readonly promos: PromoCardRepositoryPort) {}

  async execute(command: CreatePromoCommand): Promise<PromoCard> {
    const attributes = PromoCard.validate({
      title: command.title,
      subtitle: command.subtitle,
      imageUrl: command.imageUrl ?? null,
      icon: command.icon ?? null,
      order: command.order ?? 0,
      active: command.active ?? true,
    });
    return this.promos.create(attributes);
  }
}
