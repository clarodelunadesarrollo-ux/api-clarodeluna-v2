import {
    buildPromoCard,
    createFakePromoCardRepository,
    FakePromoCardRepository,
} from './__testing__/promos.fixtures';
import { ListActivePromosUseCase } from './list-active-promos.use-case';

describe('ListActivePromosUseCase', () => {
  let promos: FakePromoCardRepository;
  let useCase: ListActivePromosUseCase;

  beforeEach(() => {
    promos = createFakePromoCardRepository();
    useCase = new ListActivePromosUseCase(promos);
  });

  it('returns the active cards from the repository', async () => {
    const cards = [buildPromoCard(), buildPromoCard({ id: 'other', order: 2 })];
    promos.findActiveOrdered.mockResolvedValue(cards);

    await expect(useCase.execute()).resolves.toBe(cards);
    expect(promos.findActiveOrdered).toHaveBeenCalledTimes(1);
  });
});
