import { PromoCardNotFoundException } from '../../domain/exceptions/promo-card-not-found.exception';
import {
    buildPromoCard,
    createFakePromoCardRepository,
    FakePromoCardRepository,
} from './__testing__/promos.fixtures';
import { UpdatePromoUseCase } from './update-promo.use-case';

describe('UpdatePromoUseCase', () => {
  let promos: FakePromoCardRepository;
  let useCase: UpdatePromoUseCase;

  beforeEach(() => {
    promos = createFakePromoCardRepository();
    useCase = new UpdatePromoUseCase(promos);
  });

  it('throws when the card does not exist', async () => {
    promos.findById.mockResolvedValue(null);

    await expect(
      useCase.execute('missing-id', { title: 'Nuevo' }),
    ).rejects.toBeInstanceOf(PromoCardNotFoundException);
    expect(promos.update).not.toHaveBeenCalled();
  });

  it('only forwards the provided fields, trimmed', async () => {
    promos.findById.mockResolvedValue(buildPromoCard());
    promos.update.mockResolvedValue(buildPromoCard({ title: 'Editada' }));

    await useCase.execute('33333333-3333-3333-3333-333333333333', {
      title: '  Editada  ',
      active: false,
    });

    expect(promos.update).toHaveBeenCalledWith(
      '33333333-3333-3333-3333-333333333333',
      { title: 'Editada', active: false },
    );
  });

  it('clears the image when null is provided', async () => {
    promos.findById.mockResolvedValue(
      buildPromoCard({ imageUrl: 'https://example.com/a.jpg' }),
    );
    promos.update.mockResolvedValue(buildPromoCard({ imageUrl: null }));

    await useCase.execute('33333333-3333-3333-3333-333333333333', {
      imageUrl: null,
    });

    expect(promos.update).toHaveBeenCalledWith(
      '33333333-3333-3333-3333-333333333333',
      { imageUrl: null },
    );
  });
});
