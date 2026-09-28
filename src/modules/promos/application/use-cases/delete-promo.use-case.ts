import { PromoCardNotFoundException } from '../../domain/exceptions/promo-card-not-found.exception';
import { DeletePromoUseCasePort } from '../ports/in/delete-promo.port';
import { PromoCardRepositoryPort } from '../ports/out/promo-card-repository.port';
import { PromoImageStoragePort } from '../ports/out/promo-image-storage.port';

export class DeletePromoUseCase implements DeletePromoUseCasePort {
  constructor(
    private readonly promos: PromoCardRepositoryPort,
    private readonly images: PromoImageStoragePort,
  ) {}

  async execute(id: string): Promise<void> {
    const current = await this.promos.findById(id);
    if (current === null) {
      throw new PromoCardNotFoundException();
    }
    await this.promos.delete(id);

    // Best-effort cleanup of the remote image once the row is gone.
    if (current.imageUrl !== null) {
      await this.images.delete(current.imageUrl);
    }
  }
}
