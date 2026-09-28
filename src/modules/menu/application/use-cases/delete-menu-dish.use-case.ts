import { MenuDishNotFoundException } from '../../domain/exceptions/menu-dish-not-found.exception';
import { DeleteMenuDishUseCasePort } from '../ports/in/delete-menu-dish.port';
import { MenuDishRepositoryPort } from '../ports/out/menu-dish-repository.port';
import { MenuMediaStoragePort } from '../ports/out/menu-media-storage.port';

export class DeleteMenuDishUseCase implements DeleteMenuDishUseCasePort {
  constructor(
    private readonly dishes: MenuDishRepositoryPort,
    private readonly media: MenuMediaStoragePort,
  ) {}

  async execute(id: string): Promise<void> {
    const current = await this.dishes.findById(id);
    if (current === null) {
      throw new MenuDishNotFoundException();
    }
    await this.dishes.delete(id);
    // Best-effort: never blocks the deletion if the asset cannot be removed.
    await this.media.delete(current.imageUrl);
  }
}
