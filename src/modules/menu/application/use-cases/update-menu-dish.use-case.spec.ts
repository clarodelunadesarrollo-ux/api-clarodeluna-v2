import { MenuDishNotFoundException } from '../../domain/exceptions/menu-dish-not-found.exception';
import {
    buildMenuDish,
    createFakeMenuDishRepository,
    FakeMenuDishRepository,
} from './__testing__/menu.fixtures';
import { UpdateMenuDishUseCase } from './update-menu-dish.use-case';

describe('UpdateMenuDishUseCase', () => {
  let dishes: FakeMenuDishRepository;
  let useCase: UpdateMenuDishUseCase;

  const id = '22222222-2222-2222-2222-222222222222';

  beforeEach(() => {
    dishes = createFakeMenuDishRepository();
    useCase = new UpdateMenuDishUseCase(dishes);
  });

  it('throws MenuDishNotFoundException when the dish does not exist', async () => {
    dishes.findById.mockResolvedValue(null);

    await expect(useCase.execute(id, { name: 'Nuevo' })).rejects.toBeInstanceOf(
      MenuDishNotFoundException,
    );
    expect(dishes.update).not.toHaveBeenCalled();
  });

  it('allows clearing the price by passing null', async () => {
    dishes.findById.mockResolvedValue(buildMenuDish({ id, priceCents: 650000 }));
    dishes.update.mockResolvedValue(buildMenuDish({ id, priceCents: null }));

    await useCase.execute(id, { priceCents: null });

    expect(dishes.update).toHaveBeenCalledWith(id, { priceCents: null });
  });

  it('only forwards the provided changes after validating the merged result', async () => {
    dishes.findById.mockResolvedValue(buildMenuDish({ id, name: 'Provoleta' }));
    dishes.update.mockResolvedValue(buildMenuDish({ id, name: 'Provoleta XL' }));

    await useCase.execute(id, { name: '  Provoleta XL  ' });

    expect(dishes.update).toHaveBeenCalledWith(id, { name: 'Provoleta XL' });
  });
});
