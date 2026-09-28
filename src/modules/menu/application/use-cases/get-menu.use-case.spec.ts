import { MenuType } from '../../domain/enums/menu-type.enum';
import { NoActiveMenuContextException } from '../../domain/exceptions/no-active-menu-context.exception';
import {
    buildMenuSection,
    createFakeMenuSectionRepository,
    createFakeReservationContext,
    FakeMenuSectionRepository,
    FakeReservationContext,
} from './__testing__/menu.fixtures';
import { GetMenuUseCase } from './get-menu.use-case';

describe('GetMenuUseCase', () => {
  let context: FakeReservationContext;
  let sections: FakeMenuSectionRepository;
  let useCase: GetMenuUseCase;

  const userId = '99999999-9999-9999-9999-999999999999';

  beforeEach(() => {
    context = createFakeReservationContext();
    sections = createFakeMenuSectionRepository();
    useCase = new GetMenuUseCase(context, sections);
  });

  it('returns the RESTAURANT menu when the active context is RESTAURANT', async () => {
    const section = buildMenuSection({ menuType: MenuType.RESTAURANT });
    context.resolveActiveMenuType.mockResolvedValue(MenuType.RESTAURANT);
    sections.findActiveByMenuTypeWithDishes.mockResolvedValue([section]);

    const result = await useCase.execute(userId);

    expect(context.resolveActiveMenuType).toHaveBeenCalledWith(userId);
    expect(sections.findActiveByMenuTypeWithDishes).toHaveBeenCalledWith(
      MenuType.RESTAURANT,
    );
    expect(result).toEqual({ menuType: MenuType.RESTAURANT, sections: [section] });
  });

  it('returns the TOUR menu when the active context is TOUR', async () => {
    const section = buildMenuSection({ menuType: MenuType.TOUR, title: 'Menú del día' });
    context.resolveActiveMenuType.mockResolvedValue(MenuType.TOUR);
    sections.findActiveByMenuTypeWithDishes.mockResolvedValue([section]);

    const result = await useCase.execute(userId);

    expect(sections.findActiveByMenuTypeWithDishes).toHaveBeenCalledWith(MenuType.TOUR);
    expect(result.menuType).toBe(MenuType.TOUR);
  });

  it('throws NoActiveMenuContextException when there is no check-in today', async () => {
    context.resolveActiveMenuType.mockResolvedValue(null);

    await expect(useCase.execute(userId)).rejects.toBeInstanceOf(
      NoActiveMenuContextException,
    );
    expect(sections.findActiveByMenuTypeWithDishes).not.toHaveBeenCalled();
  });
});
