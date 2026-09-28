import { MenuSectionNotFoundException } from '../../domain/exceptions/menu-section-not-found.exception';
import { DeleteMenuSectionUseCasePort } from '../ports/in/delete-menu-section.port';
import { MenuSectionRepositoryPort } from '../ports/out/menu-section-repository.port';

export class DeleteMenuSectionUseCase implements DeleteMenuSectionUseCasePort {
  constructor(private readonly sections: MenuSectionRepositoryPort) {}

  async execute(id: string): Promise<void> {
    const current = await this.sections.findById(id);
    if (current === null) {
      throw new MenuSectionNotFoundException();
    }
    await this.sections.delete(id);
  }
}
