import { MenuType } from '../../domain/enums/menu-type.enum';
import { InvalidMenuSectionException } from '../../domain/exceptions/invalid-menu-section.exception';
import {
    buildMenuSection,
    createFakeMenuSectionRepository,
    FakeMenuSectionRepository,
} from './__testing__/menu.fixtures';
import { CreateMenuSectionUseCase } from './create-menu-section.use-case';

describe('CreateMenuSectionUseCase', () => {
  let sections: FakeMenuSectionRepository;
  let useCase: CreateMenuSectionUseCase;

  beforeEach(() => {
    sections = createFakeMenuSectionRepository();
    useCase = new CreateMenuSectionUseCase(sections);
  });

  it('validates, trims and persists the section defaulting active to true', async () => {
    const created = buildMenuSection();
    sections.create.mockResolvedValue(created);

    const result = await useCase.execute({
      menuType: MenuType.RESTAURANT,
      title: '  Entradas  ',
      order: 1,
    });

    expect(sections.create).toHaveBeenCalledWith({
      menuType: MenuType.RESTAURANT,
      title: 'Entradas',
      order: 1,
      active: true,
    });
    expect(result).toBe(created);
  });

  it('rejects an empty title without touching the repository', async () => {
    await expect(
      useCase.execute({ menuType: MenuType.RESTAURANT, title: '   ', order: 1 }),
    ).rejects.toBeInstanceOf(InvalidMenuSectionException);
    expect(sections.create).not.toHaveBeenCalled();
  });

  it('rejects a negative order', async () => {
    await expect(
      useCase.execute({ menuType: MenuType.RESTAURANT, title: 'Entradas', order: -1 }),
    ).rejects.toBeInstanceOf(InvalidMenuSectionException);
    expect(sections.create).not.toHaveBeenCalled();
  });
});
