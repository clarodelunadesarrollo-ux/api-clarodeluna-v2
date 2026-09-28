import { InvalidMenuDishException } from '../../domain/exceptions/invalid-menu-dish.exception';
import { MenuSectionNotFoundException } from '../../domain/exceptions/menu-section-not-found.exception';
import {
    buildMenuDish,
    buildMenuSection,
    createFakeMenuDishRepository,
    createFakeMenuSectionRepository,
    FakeMenuDishRepository,
    FakeMenuSectionRepository,
} from './__testing__/menu.fixtures';
import { CreateMenuDishUseCase } from './create-menu-dish.use-case';

describe('CreateMenuDishUseCase', () => {
  let dishes: FakeMenuDishRepository;
  let sections: FakeMenuSectionRepository;
  let useCase: CreateMenuDishUseCase;

  const sectionId = '11111111-1111-1111-1111-111111111111';

  beforeEach(() => {
    dishes = createFakeMenuDishRepository();
    sections = createFakeMenuSectionRepository();
    useCase = new CreateMenuDishUseCase(dishes, sections);
  });

  it('validates, trims and persists the dish defaulting price/tags/active', async () => {
    sections.findById.mockResolvedValue(buildMenuSection({ id: sectionId }));
    const created = buildMenuDish();
    dishes.create.mockResolvedValue(created);

    const result = await useCase.execute({
      sectionId,
      name: '  Provoleta  ',
      description: '  Queso grillado.  ',
      imageUrl: 'https://res.cloudinary.com/demo/image/upload/v1/p.jpg',
      order: 1,
    });

    expect(dishes.create).toHaveBeenCalledWith({
      sectionId,
      name: 'Provoleta',
      description: 'Queso grillado.',
      imageUrl: 'https://res.cloudinary.com/demo/image/upload/v1/p.jpg',
      priceCents: null,
      tags: [],
      order: 1,
      active: true,
    });
    expect(result).toBe(created);
  });

  it('throws MenuSectionNotFoundException when the parent section is missing', async () => {
    sections.findById.mockResolvedValue(null);

    await expect(
      useCase.execute({
        sectionId,
        name: 'Provoleta',
        description: 'Queso grillado.',
        imageUrl: 'https://res.cloudinary.com/demo/image/upload/v1/p.jpg',
        order: 1,
      }),
    ).rejects.toBeInstanceOf(MenuSectionNotFoundException);
    expect(dishes.create).not.toHaveBeenCalled();
  });

  it('rejects an empty name without touching the repository', async () => {
    sections.findById.mockResolvedValue(buildMenuSection({ id: sectionId }));

    await expect(
      useCase.execute({
        sectionId,
        name: '   ',
        description: 'Queso grillado.',
        imageUrl: 'https://res.cloudinary.com/demo/image/upload/v1/p.jpg',
        order: 1,
      }),
    ).rejects.toBeInstanceOf(InvalidMenuDishException);
    expect(dishes.create).not.toHaveBeenCalled();
  });

  it('rejects a negative price', async () => {
    sections.findById.mockResolvedValue(buildMenuSection({ id: sectionId }));

    await expect(
      useCase.execute({
        sectionId,
        name: 'Provoleta',
        description: 'Queso grillado.',
        imageUrl: 'https://res.cloudinary.com/demo/image/upload/v1/p.jpg',
        priceCents: -10,
        order: 1,
      }),
    ).rejects.toBeInstanceOf(InvalidMenuDishException);
    expect(dishes.create).not.toHaveBeenCalled();
  });
});
