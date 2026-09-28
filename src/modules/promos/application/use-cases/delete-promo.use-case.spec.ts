import { PromoCardNotFoundException } from '../../domain/exceptions/promo-card-not-found.exception';
import {
    buildPromoCard,
    createFakePromoCardRepository,
    createFakePromoImageStorage,
    FakePromoCardRepository,
    FakePromoImageStorage,
} from './__testing__/promos.fixtures';
import { DeletePromoUseCase } from './delete-promo.use-case';

describe('DeletePromoUseCase', () => {
  let promos: FakePromoCardRepository;
  let images: FakePromoImageStorage;
  let useCase: DeletePromoUseCase;

  const id = '33333333-3333-3333-3333-333333333333';

  beforeEach(() => {
    promos = createFakePromoCardRepository();
    images = createFakePromoImageStorage();
    useCase = new DeletePromoUseCase(promos, images);
  });

  it('throws when the card does not exist', async () => {
    promos.findById.mockResolvedValue(null);

    await expect(useCase.execute('missing-id')).rejects.toBeInstanceOf(
      PromoCardNotFoundException,
    );
    expect(promos.delete).not.toHaveBeenCalled();
    expect(images.delete).not.toHaveBeenCalled();
  });

  it('deletes a card and cleans up its image asset', async () => {
    promos.findById.mockResolvedValue(
      buildPromoCard({
        id,
        imageUrl: 'https://res.cloudinary.com/demo/image/upload/v1/promos/p.jpg',
      }),
    );
    promos.delete.mockResolvedValue(undefined);

    await useCase.execute(id);

    expect(promos.delete).toHaveBeenCalledWith(id);
    expect(images.delete).toHaveBeenCalledWith(
      'https://res.cloudinary.com/demo/image/upload/v1/promos/p.jpg',
    );
  });

  it('deletes a card with no image without touching storage', async () => {
    promos.findById.mockResolvedValue(buildPromoCard({ id, imageUrl: null }));
    promos.delete.mockResolvedValue(undefined);

    await useCase.execute(id);

    expect(promos.delete).toHaveBeenCalledWith(id);
    expect(images.delete).not.toHaveBeenCalled();
  });
});
