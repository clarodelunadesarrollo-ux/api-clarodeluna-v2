import { HuertaItemNotFoundException } from '../../domain/exceptions/huerta-item-not-found.exception';
import { DeleteHuertaItemUseCasePort } from '../ports/in/delete-huerta-item.port';
import { HuertaItemRepositoryPort } from '../ports/out/huerta-item-repository.port';
import { HuertaMediaStoragePort } from '../ports/out/huerta-media-storage.port';

export class DeleteHuertaItemUseCase implements DeleteHuertaItemUseCasePort {
  constructor(
    private readonly items: HuertaItemRepositoryPort,
    private readonly media: HuertaMediaStoragePort,
  ) {}

  async execute(id: string): Promise<void> {
    const current = await this.items.findById(id);
    if (current === null) {
      throw new HuertaItemNotFoundException();
    }
    await this.items.delete(id);

    // Best-effort cleanup of the remote assets once the row is gone.
    await this.media.delete(current.mediaUrl);
    if (current.posterUrl !== null) {
      await this.media.delete(current.posterUrl);
    }
  }
}
