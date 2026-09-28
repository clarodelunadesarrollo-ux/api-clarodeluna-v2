import { MenuSection } from '../../domain/entities/menu-section.entity';
import { MenuSectionNotFoundException } from '../../domain/exceptions/menu-section-not-found.exception';
import {
    UpdateMenuSectionCommand,
    UpdateMenuSectionUseCasePort,
} from '../ports/in/update-menu-section.port';
import {
    MenuSectionRepositoryPort,
    UpdateMenuSectionData,
} from '../ports/out/menu-section-repository.port';

export class UpdateMenuSectionUseCase implements UpdateMenuSectionUseCasePort {
  constructor(private readonly sections: MenuSectionRepositoryPort) {}

  async execute(id: string, command: UpdateMenuSectionCommand): Promise<MenuSection> {
    const current = await this.sections.findById(id);
    if (current === null) {
      throw new MenuSectionNotFoundException();
    }

    // Validate the resulting section as a whole (current values merged with the
    // provided changes) so invariants hold regardless of which fields change.
    const merged = MenuSection.validate({
      menuType: command.menuType ?? current.menuType,
      title: command.title ?? current.title,
      order: command.order ?? current.order,
      active: command.active ?? current.active,
    });

    const changes: UpdateMenuSectionData = {};
    if (command.menuType !== undefined) changes.menuType = merged.menuType;
    if (command.title !== undefined) changes.title = merged.title;
    if (command.order !== undefined) changes.order = merged.order;
    if (command.active !== undefined) changes.active = merged.active;

    return this.sections.update(id, changes);
  }
}
