import { InvalidPromoCardException } from '../../domain/exceptions/invalid-promo-card.exception';
import {
    buildPromoCard,
    createFakePromoCardRepository,
    FakePromoCardRepository,
} from './__testing__/promos.fixtures';
import { CreatePromoUseCase } from './create-promo.use-case';

describe('CreatePromoUseCase', () => {
  let promos: FakePromoCardRepository;
  let useCase: CreatePromoUseCase;

  beforeEach(() => {
    promos = createFakePromoCardRepository();
    useCase = new CreatePromoUseCase(promos);
  });

  it('validates, trims and persists a card, defaulting order and active', async () => {
    promos.create.mockResolvedValue(buildPromoCard());

    await useCase.execute({
      title: '  Noche de cosecha  ',
      subtitle: '  Menú de autor con productos de nuestra huerta.  ',
      icon: 'restaurant',
    });

    expect(promos.create).toHaveBeenCalledWith({
      title: 'Noche de cosecha',
      subtitle: 'Menú de autor con productos de nuestra huerta.',
      imageUrl: null,
      icon: 'restaurant',
      order: 0,
      active: true,
    });
  });

  it('normalizes an empty image URL to null', async () => {
    promos.create.mockResolvedValue(buildPromoCard());

    await useCase.execute({
      title: 'Maridaje',
      subtitle: 'Vinos seleccionados.',
      imageUrl: '   ',
      order: 3,
      active: false,
    });

    expect(promos.create).toHaveBeenCalledWith(
      expect.objectContaining({
        imageUrl: null,
        order: 3,
        active: false,
      }),
    );
  });

  it('rejects a card with an empty title (domain invariant)', async () => {
    await expect(
      useCase.execute({ title: '   ', subtitle: 'Subtítulo' }),
    ).rejects.toBeInstanceOf(InvalidPromoCardException);
    expect(promos.create).not.toHaveBeenCalled();
  });

  it('rejects a card with a negative order (domain invariant)', async () => {
    await expect(
      useCase.execute({ title: 'Título', subtitle: 'Subtítulo', order: -1 }),
    ).rejects.toBeInstanceOf(InvalidPromoCardException);
    expect(promos.create).not.toHaveBeenCalled();
  });
});
