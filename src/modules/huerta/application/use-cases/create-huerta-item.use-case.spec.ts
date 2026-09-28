import { HuertaItemType } from '../../domain/enums/huerta-item-type.enum';
import { InvalidHuertaItemException } from '../../domain/exceptions/invalid-huerta-item.exception';
import {
    buildHuertaItem,
    createFakeHuertaItemRepository,
    FakeHuertaItemRepository,
} from './__testing__/huerta.fixtures';
import { CreateHuertaItemUseCase } from './create-huerta-item.use-case';

describe('CreateHuertaItemUseCase', () => {
  let items: FakeHuertaItemRepository;
  let useCase: CreateHuertaItemUseCase;

  beforeEach(() => {
    items = createFakeHuertaItemRepository();
    useCase = new CreateHuertaItemUseCase(items);
  });

  it('validates, trims and persists an IMAGE item, nulling the poster and defaulting active', async () => {
    items.create.mockResolvedValue(buildHuertaItem());

    await useCase.execute({
      type: HuertaItemType.IMAGE,
      title: '  Nuestra huerta  ',
      mediaUrl: 'https://res.cloudinary.com/demo/image/upload/v1/p.jpg',
      posterUrl: 'https://res.cloudinary.com/demo/image/upload/v1/ignored.jpg',
      order: 1,
    });

    expect(items.create).toHaveBeenCalledWith({
      type: HuertaItemType.IMAGE,
      title: 'Nuestra huerta',
      description: null,
      mediaUrl: 'https://res.cloudinary.com/demo/image/upload/v1/p.jpg',
      posterUrl: null,
      order: 1,
      active: true,
    });
  });

  it('persists a VIDEO item keeping its poster', async () => {
    items.create.mockResolvedValue(buildHuertaItem({ type: HuertaItemType.VIDEO }));

    await useCase.execute({
      type: HuertaItemType.VIDEO,
      title: 'Riego',
      mediaUrl: 'https://res.cloudinary.com/demo/video/upload/v1/v.mp4',
      posterUrl: 'https://res.cloudinary.com/demo/image/upload/v1/poster.jpg',
      order: 2,
    });

    expect(items.create).toHaveBeenCalledWith(
      expect.objectContaining({
        type: HuertaItemType.VIDEO,
        posterUrl: 'https://res.cloudinary.com/demo/image/upload/v1/poster.jpg',
      }),
    );
  });

  it('rejects a VIDEO item without a poster (domain invariant)', async () => {
    await expect(
      useCase.execute({
        type: HuertaItemType.VIDEO,
        title: 'Riego',
        mediaUrl: 'https://res.cloudinary.com/demo/video/upload/v1/v.mp4',
        order: 2,
      }),
    ).rejects.toBeInstanceOf(InvalidHuertaItemException);
    expect(items.create).not.toHaveBeenCalled();
  });

  it('rejects an empty title', async () => {
    await expect(
      useCase.execute({
        type: HuertaItemType.IMAGE,
        title: '   ',
        mediaUrl: 'https://res.cloudinary.com/demo/image/upload/v1/p.jpg',
        order: 1,
      }),
    ).rejects.toBeInstanceOf(InvalidHuertaItemException);
    expect(items.create).not.toHaveBeenCalled();
  });
});
