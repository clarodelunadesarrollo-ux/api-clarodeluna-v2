import { HuertaItemType } from '../../domain/enums/huerta-item-type.enum';
import { HuertaItemNotFoundException } from '../../domain/exceptions/huerta-item-not-found.exception';
import { InvalidHuertaItemException } from '../../domain/exceptions/invalid-huerta-item.exception';
import {
    buildHuertaItem,
    createFakeHuertaItemRepository,
    FakeHuertaItemRepository,
} from './__testing__/huerta.fixtures';
import { UpdateHuertaItemUseCase } from './update-huerta-item.use-case';

describe('UpdateHuertaItemUseCase', () => {
  let items: FakeHuertaItemRepository;
  let useCase: UpdateHuertaItemUseCase;

  const id = '22222222-2222-2222-2222-222222222222';

  beforeEach(() => {
    items = createFakeHuertaItemRepository();
    useCase = new UpdateHuertaItemUseCase(items);
  });

  it('throws HuertaItemNotFoundException when the item is missing', async () => {
    items.findById.mockResolvedValue(null);

    await expect(useCase.execute(id, { title: 'X' })).rejects.toBeInstanceOf(
      HuertaItemNotFoundException,
    );
    expect(items.update).not.toHaveBeenCalled();
  });

  it('updates only the provided fields', async () => {
    items.findById.mockResolvedValue(buildHuertaItem({ id, title: 'Old' }));
    items.update.mockResolvedValue(buildHuertaItem({ id, title: 'New' }));

    await useCase.execute(id, { title: '  New  ' });

    expect(items.update).toHaveBeenCalledWith(id, { title: 'New' });
  });

  it('nulls the poster when switching a VIDEO item to IMAGE', async () => {
    items.findById.mockResolvedValue(buildHuertaItem({ id, type: HuertaItemType.VIDEO }));
    items.update.mockResolvedValue(buildHuertaItem({ id, type: HuertaItemType.IMAGE }));

    await useCase.execute(id, { type: HuertaItemType.IMAGE });

    expect(items.update).toHaveBeenCalledWith(id, {
      type: HuertaItemType.IMAGE,
      posterUrl: null,
    });
  });

  it('rejects switching to VIDEO without a poster (invariant)', async () => {
    items.findById.mockResolvedValue(buildHuertaItem({ id, type: HuertaItemType.IMAGE }));

    await expect(
      useCase.execute(id, { type: HuertaItemType.VIDEO }),
    ).rejects.toBeInstanceOf(InvalidHuertaItemException);
    expect(items.update).not.toHaveBeenCalled();
  });
});
