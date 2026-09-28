import { InvalidMenuMediaException } from '../../domain/exceptions/invalid-menu-media.exception';
import {
    createFakeMenuMediaStorage,
    FakeMenuMediaStorage,
} from './__testing__/menu.fixtures';
import { UploadMenuMediaUseCase } from './upload-menu-media.use-case';

describe('UploadMenuMediaUseCase', () => {
  let storage: FakeMenuMediaStorage;
  let useCase: UploadMenuMediaUseCase;

  beforeEach(() => {
    storage = createFakeMenuMediaStorage();
    useCase = new UploadMenuMediaUseCase(storage);
  });

  it('uploads a valid image and returns its URL', async () => {
    storage.upload.mockResolvedValue({ url: 'https://cdn/menu/dish.jpg' });

    const result = await useCase.execute({
      buffer: Buffer.from('image-bytes'),
      mimeType: 'image/jpeg',
    });

    expect(result).toEqual({ imageUrl: 'https://cdn/menu/dish.jpg' });
    expect(storage.upload).toHaveBeenCalledWith({
      buffer: expect.any(Buffer),
      mimeType: 'image/jpeg',
    });
  });

  it('rejects an unsupported mime type', async () => {
    await expect(
      useCase.execute({
        buffer: Buffer.from('x'),
        mimeType: 'video/mp4',
      }),
    ).rejects.toBeInstanceOf(InvalidMenuMediaException);
    expect(storage.upload).not.toHaveBeenCalled();
  });

  it('rejects an image larger than the size cap', async () => {
    const tooLarge = Buffer.alloc(5 * 1024 * 1024 + 1);

    await expect(
      useCase.execute({ buffer: tooLarge, mimeType: 'image/png' }),
    ).rejects.toBeInstanceOf(InvalidMenuMediaException);
    expect(storage.upload).not.toHaveBeenCalled();
  });
});
