import { MenuDish } from '../../domain/entities/menu-dish.entity';
import { MenuSectionNotFoundException } from '../../domain/exceptions/menu-section-not-found.exception';
import {
    CreateMenuDishCommand,
    CreateMenuDishUseCasePort,
} from '../ports/in/create-menu-dish.port';
import { MenuDishRepositoryPort } from '../ports/out/menu-dish-repository.port';
import { MenuSectionRepositoryPort } from '../ports/out/menu-section-repository.port';

export class CreateMenuDishUseCase implements CreateMenuDishUseCasePort {
  constructor(
    private readonly dishes: MenuDishRepositoryPort,
    private readonly sections: MenuSectionRepositoryPort,
  ) {}

  async execute(command: CreateMenuDishCommand): Promise<MenuDish> {
    const section = await this.sections.findById(command.sectionId);
    if (section === null) {
      throw new MenuSectionNotFoundException();
    }

    const attributes = MenuDish.validate({
      sectionId: command.sectionId,
      name: command.name,
      description: command.description,
      imageUrl: command.imageUrl,
      priceCents: command.priceCents ?? null,
      tags: command.tags ?? [],
      order: command.order,
      active: command.active ?? true,
    });
    return this.dishes.create(attributes);
  }
}
