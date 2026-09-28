import { MenuDishNotFoundException } from '../../domain/exceptions/menu-dish-not-found.exception';
import {
    buildMenuDish,
    createFakeMenuDishRepository,
    createFakeMenuMediaStorage,
    FakeMenuDishRepository,
    FakeMenuMediaStorage,
} from './__testing__/menu.fixtures';
import { DeleteMenuDishUseCase } from './delete-menu-dish.use-case';

describe('DeleteMenuDishUseCase', () => {
  let dishes: FakeMenuDishRepository;
  let media: FakeMenuMediaStorage;
  let useCase: DeleteMenuDishUseCase;

  const id = '22222222-2222-2222-2222-222222222222';

  beforeEach(() => {
    dishes = createFakeMenuDishRepository();
    media = createFakeMenuMediaStorage();
    useCase = new DeleteMenuDishUseCase(dishes, media);
  });

  it('throws MenuDishNotFoundException when the dish does not exist', async () => {
    dishes.findById.mockResolvedValue(null);

    await expect(useCase.execute(id)).rejects.toBeInstanceOf(
      MenuDishNotFoundException,
    );
    expect(dishes.delete).not.toHaveBeenCalled();
    expect(media.delete).not.toHaveBeenCalled();
  });

  it('deletes an existing dish and removes its image from storage', async () => {
    const imageUrl =
      'https://res.cloudinary.com/demo/image/authenticated/s--x--/v1/menu/dish.jpg';
    dishes.findById.mockResolvedValue(buildMenuDish({ id, imageUrl }));

    await useCase.execute(id);

    expect(dishes.delete).toHaveBeenCalledWith(id);
    expect(media.delete).toHaveBeenCalledWith(imageUrl);
  });
});
