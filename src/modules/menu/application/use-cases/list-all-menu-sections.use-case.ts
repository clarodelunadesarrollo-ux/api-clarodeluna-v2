import { MenuSection } from '../../domain/entities/menu-section.entity';
import { ListAllMenuSectionsUseCasePort } from '../ports/in/list-all-menu-sections.port';
import { MenuSectionRepositoryPort } from '../ports/out/menu-section-repository.port';

export class ListAllMenuSectionsUseCase implements ListAllMenuSectionsUseCasePort {
  constructor(private readonly sections: MenuSectionRepositoryPort) {}

  execute(): Promise<MenuSection[]> {
    return this.sections.findAllWithDishes();
  }
}
