import { HuertaItem } from '../../domain/entities/huerta-item.entity';
import { HuertaItemNotFoundException } from '../../domain/exceptions/huerta-item-not-found.exception';
import {
    UpdateHuertaItemCommand,
    UpdateHuertaItemUseCasePort,
} from '../ports/in/update-huerta-item.port';
import {
    HuertaItemRepositoryPort,
    UpdateHuertaItemData,
} from '../ports/out/huerta-item-repository.port';

export class UpdateHuertaItemUseCase implements UpdateHuertaItemUseCasePort {
  constructor(private readonly items: HuertaItemRepositoryPort) {}

  async execute(id: string, command: UpdateHuertaItemCommand): Promise<HuertaItem> {
    const current = await this.items.findById(id);
    if (current === null) {
      throw new HuertaItemNotFoundException();
    }

    // Validate the resulting item as a whole (current values merged with the
    // provided changes) so the VIDEO => posterUrl invariant holds no matter
    // which fields change.
    const merged = HuertaItem.validate({
      type: command.type ?? current.type,
      title: command.title ?? current.title,
      description:
        command.description !== undefined ? command.description : current.description,
      mediaUrl: command.mediaUrl ?? current.mediaUrl,
      posterUrl:
        command.posterUrl !== undefined ? command.posterUrl : current.posterUrl,
      order: command.order ?? current.order,
      active: command.active ?? current.active,
    });

    const changes: UpdateHuertaItemData = {};
    if (command.title !== undefined) changes.title = merged.title;
    if (command.description !== undefined) changes.description = merged.description;
    if (command.mediaUrl !== undefined) changes.mediaUrl = merged.mediaUrl;
    if (command.order !== undefined) changes.order = merged.order;
    if (command.active !== undefined) changes.active = merged.active;
    // Type and poster travel together: switching type may normalize the poster
    // to null (IMAGE) or require it (VIDEO), so sync both when either changes.
    if (command.type !== undefined || command.posterUrl !== undefined) {
      changes.type = merged.type;
      changes.posterUrl = merged.posterUrl;
    }

    return this.items.update(id, changes);
  }
}
