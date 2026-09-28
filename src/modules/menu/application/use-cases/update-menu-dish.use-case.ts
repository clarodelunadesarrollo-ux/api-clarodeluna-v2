import { MenuDish } from '../../domain/entities/menu-dish.entity';
import { MenuDishNotFoundException } from '../../domain/exceptions/menu-dish-not-found.exception';
import {
    UpdateMenuDishCommand,
    UpdateMenuDishUseCasePort,
} from '../ports/in/update-menu-dish.port';
import {
    MenuDishRepositoryPort,
    UpdateMenuDishData,
} from '../ports/out/menu-dish-repository.port';

export class UpdateMenuDishUseCase implements UpdateMenuDishUseCasePort {
  constructor(private readonly dishes: MenuDishRepositoryPort) {}

  async execute(id: string, command: UpdateMenuDishCommand): Promise<MenuDish> {
    const current = await this.dishes.findById(id);
    if (current === null) {
      throw new MenuDishNotFoundException();
    }

    // Validate the resulting dish as a whole (current values merged with the
    // provided changes) so invariants hold regardless of which fields change.
    const merged = MenuDish.validate({
      sectionId: current.sectionId,
      name: command.name ?? current.name,
      description: command.description ?? current.description,
      imageUrl: command.imageUrl ?? current.imageUrl,
      priceCents:
        command.priceCents !== undefined ? command.priceCents : current.priceCents,
      tags: command.tags ?? current.tags,
      order: command.order ?? current.order,
      active: command.active ?? current.active,
    });

    const changes: UpdateMenuDishData = {};
    if (command.name !== undefined) changes.name = merged.name;
    if (command.description !== undefined) changes.description = merged.description;
    if (command.imageUrl !== undefined) changes.imageUrl = merged.imageUrl;
    if (command.priceCents !== undefined) changes.priceCents = merged.priceCents;
    if (command.tags !== undefined) changes.tags = merged.tags;
    if (command.order !== undefined) changes.order = merged.order;
    if (command.active !== undefined) changes.active = merged.active;

    return this.dishes.update(id, changes);
  }
}
