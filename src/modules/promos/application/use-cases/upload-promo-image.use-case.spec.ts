import { InvalidPromoImageException } from '../../domain/exceptions/invalid-promo-image.exception';
import { PromoImageStoragePort } from '../ports/out/promo-image-storage.port';
import { UploadPromoImageUseCase } from './upload-promo-image.use-case';

describe('UploadPromoImageUseCase', () => {
  let storage: jest.Mocked<PromoImageStoragePort>;
  let useCase: UploadPromoImageUseCase;

  beforeEach(() => {
    storage = { upload: jest.fn(), delete: jest.fn() };
    useCase = new UploadPromoImageUseCase(storage);
  });

  it('uploads a valid image and returns the public URL', async () => {
    storage.upload.mockResolvedValue({
      url: 'https://res.cloudinary.com/demo/image/upload/v1/promos/pic.jpg',
    });
    const buffer = Buffer.from('fake-image-bytes');

    const result = await useCase.execute({ buffer, mimeType: 'image/png' });

    expect(storage.upload).toHaveBeenCalledWith({
      buffer,
      mimeType: 'image/png',
    });
    expect(result).toEqual({
      imageUrl: 'https://res.cloudinary.com/demo/image/upload/v1/promos/pic.jpg',
    });
  });

  it('rejects an unsupported mime type without touching storage', async () => {
    await expect(
      useCase.execute({
        buffer: Buffer.from('not-an-image'),
        mimeType: 'application/pdf',
      }),
    ).rejects.toBeInstanceOf(InvalidPromoImageException);
    expect(storage.upload).not.toHaveBeenCalled();
  });

  it('rejects an image larger than the size cap without touching storage', async () => {
    const tooLarge = Buffer.alloc(5 * 1024 * 1024 + 1);

    await expect(
      useCase.execute({ buffer: tooLarge, mimeType: 'image/jpeg' }),
    ).rejects.toBeInstanceOf(InvalidPromoImageException);
    expect(storage.upload).not.toHaveBeenCalled();
  });
});
