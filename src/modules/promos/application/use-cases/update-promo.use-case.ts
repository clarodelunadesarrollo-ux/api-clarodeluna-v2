import { PromoCard } from '../../domain/entities/promo-card.entity';
import { PromoCardNotFoundException } from '../../domain/exceptions/promo-card-not-found.exception';
import {
    UpdatePromoCommand,
    UpdatePromoUseCasePort,
} from '../ports/in/update-promo.port';
import {
    PromoCardRepositoryPort,
    UpdatePromoCardData,
} from '../ports/out/promo-card-repository.port';

export class UpdatePromoUseCase implements UpdatePromoUseCasePort {
  constructor(private readonly promos: PromoCardRepositoryPort) {}

  async execute(id: string, command: UpdatePromoCommand): Promise<PromoCard> {
    const current = await this.promos.findById(id);
    if (current === null) {
      throw new PromoCardNotFoundException();
    }

    // Validate the resulting card as a whole (current values merged with the
    // provided changes) so invariants hold no matter which fields change.
    const merged = PromoCard.validate({
      title: command.title ?? current.title,
      subtitle: command.subtitle ?? current.subtitle,
      imageUrl:
        command.imageUrl !== undefined ? command.imageUrl : current.imageUrl,
      icon: command.icon !== undefined ? command.icon : current.icon,
      order: command.order ?? current.order,
      active: command.active ?? current.active,
    });

    const changes: UpdatePromoCardData = {};
    if (command.title !== undefined) changes.title = merged.title;
    if (command.subtitle !== undefined) changes.subtitle = merged.subtitle;
    if (command.imageUrl !== undefined) changes.imageUrl = merged.imageUrl;
    if (command.icon !== undefined) changes.icon = merged.icon;
    if (command.order !== undefined) changes.order = merged.order;
    if (command.active !== undefined) changes.active = merged.active;

    return this.promos.update(id, changes);
  }
}
