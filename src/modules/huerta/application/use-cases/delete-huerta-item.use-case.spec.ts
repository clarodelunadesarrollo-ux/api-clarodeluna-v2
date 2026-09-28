import { HuertaItemType } from '../../domain/enums/huerta-item-type.enum';
import { HuertaItemNotFoundException } from '../../domain/exceptions/huerta-item-not-found.exception';
import {
    buildHuertaItem,
    createFakeHuertaItemRepository,
    createFakeHuertaMediaStorage,
    FakeHuertaItemRepository,
    FakeHuertaMediaStorage,
} from './__testing__/huerta.fixtures';
import { DeleteHuertaItemUseCase } from './delete-huerta-item.use-case';

describe('DeleteHuertaItemUseCase', () => {
  let items: FakeHuertaItemRepository;
  let media: FakeHuertaMediaStorage;
  let useCase: DeleteHuertaItemUseCase;

  const id = '22222222-2222-2222-2222-222222222222';

  beforeEach(() => {
    items = createFakeHuertaItemRepository();
    media = createFakeHuertaMediaStorage();
    useCase = new DeleteHuertaItemUseCase(items, media);
  });

  it('deletes an image item and cleans up its media asset', async () => {
    items.findById.mockResolvedValue(
      buildHuertaItem({
        id,
        type: HuertaItemType.IMAGE,
        mediaUrl: 'https://res.cloudinary.com/demo/image/upload/v1/huerta/i.jpg',
        posterUrl: null,
      }),
    );

    await useCase.execute(id);

    expect(items.delete).toHaveBeenCalledWith(id);
    expect(media.delete).toHaveBeenCalledTimes(1);
    expect(media.delete).toHaveBeenCalledWith(
      'https://res.cloudinary.com/demo/image/upload/v1/huerta/i.jpg',
    );
  });

  it('deletes a video item and cleans up both media and poster assets', async () => {
    items.findById.mockResolvedValue(
      buildHuertaItem({
        id,
        type: HuertaItemType.VIDEO,
        mediaUrl: 'https://res.cloudinary.com/demo/video/upload/v1/huerta/v.mp4',
        posterUrl:
          'https://res.cloudinary.com/demo/image/upload/v1/huerta/p.jpg',
      }),
    );

    await useCase.execute(id);

    expect(items.delete).toHaveBeenCalledWith(id);
    expect(media.delete).toHaveBeenCalledWith(
      'https://res.cloudinary.com/demo/video/upload/v1/huerta/v.mp4',
    );
    expect(media.delete).toHaveBeenCalledWith(
      'https://res.cloudinary.com/demo/image/upload/v1/huerta/p.jpg',
    );
  });

  it('throws HuertaItemNotFoundException and cleans up nothing when missing', async () => {
    items.findById.mockResolvedValue(null);

    await expect(useCase.execute(id)).rejects.toBeInstanceOf(
      HuertaItemNotFoundException,
    );
    expect(items.delete).not.toHaveBeenCalled();
    expect(media.delete).not.toHaveBeenCalled();
  });
});
