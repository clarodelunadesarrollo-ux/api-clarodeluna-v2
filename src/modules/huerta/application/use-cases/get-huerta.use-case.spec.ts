import { NoActiveHuertaContextException } from '../../domain/exceptions/no-active-huerta-context.exception';
import {
    buildHuertaItem,
    createFakeHuertaAccess,
    createFakeHuertaItemRepository,
    FakeHuertaAccess,
    FakeHuertaItemRepository,
} from './__testing__/huerta.fixtures';
import { GetHuertaUseCase } from './get-huerta.use-case';

describe('GetHuertaUseCase', () => {
  let access: FakeHuertaAccess;
  let items: FakeHuertaItemRepository;
  let useCase: GetHuertaUseCase;

  const userId = '99999999-9999-9999-9999-999999999999';

  beforeEach(() => {
    access = createFakeHuertaAccess();
    items = createFakeHuertaItemRepository();
    useCase = new GetHuertaUseCase(access, items);
  });

  it('returns the active ordered items when the user checked in today', async () => {
    const first = buildHuertaItem({ id: 'a', order: 1 });
    const second = buildHuertaItem({ id: 'b', order: 2 });
    access.hasCheckedInToday.mockResolvedValue(true);
    items.findActiveOrdered.mockResolvedValue([first, second]);

    const result = await useCase.execute(userId);

    expect(access.hasCheckedInToday).toHaveBeenCalledWith(userId);
    expect(result).toEqual([first, second]);
  });

  it('throws NoActiveHuertaContextException when there is no check-in today', async () => {
    access.hasCheckedInToday.mockResolvedValue(false);

    await expect(useCase.execute(userId)).rejects.toBeInstanceOf(
      NoActiveHuertaContextException,
    );
    expect(items.findActiveOrdered).not.toHaveBeenCalled();
  });
});
