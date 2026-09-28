import { MenuSection } from '../../domain/entities/menu-section.entity';
import {
    CreateMenuSectionCommand,
    CreateMenuSectionUseCasePort,
} from '../ports/in/create-menu-section.port';
import { MenuSectionRepositoryPort } from '../ports/out/menu-section-repository.port';

export class CreateMenuSectionUseCase implements CreateMenuSectionUseCasePort {
  constructor(private readonly sections: MenuSectionRepositoryPort) {}

  async execute(command: CreateMenuSectionCommand): Promise<MenuSection> {
    const attributes = MenuSection.validate({
      menuType: command.menuType,
      title: command.title,
      order: command.order,
      active: command.active ?? true,
    });
    return this.sections.create(attributes);
  }
}
