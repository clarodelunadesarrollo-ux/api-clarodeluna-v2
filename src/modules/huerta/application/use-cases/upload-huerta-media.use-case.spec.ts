import { InvalidHuertaMediaException } from '../../domain/exceptions/invalid-huerta-media.exception';
import { HuertaMediaStoragePort } from '../ports/out/huerta-media-storage.port';
import { UploadHuertaMediaUseCase } from './upload-huerta-media.use-case';

describe('UploadHuertaMediaUseCase', () => {
  const buildStorage = (
    url = 'https://cdn.example/huerta/x.jpg',
  ): HuertaMediaStoragePort => ({
    upload: jest.fn().mockResolvedValue({ url }),
    delete: jest.fn().mockResolvedValue(undefined),
  });

  it('uploads a valid image and returns its URL', async () => {
    const storage = buildStorage('https://cdn.example/huerta/photo.jpg');
    const useCase = new UploadHuertaMediaUseCase(storage);

    const result = await useCase.execute({
      buffer: Buffer.from('img'),
      mimeType: 'image/jpeg',
    });

    expect(result).toEqual({ mediaUrl: 'https://cdn.example/huerta/photo.jpg' });
    expect(storage.upload).toHaveBeenCalledWith({
      buffer: expect.any(Buffer),
      mimeType: 'image/jpeg',
    });
  });

  it('uploads a valid video and returns its URL', async () => {
    const storage = buildStorage('https://cdn.example/huerta/clip.mp4');
    const useCase = new UploadHuertaMediaUseCase(storage);

    const result = await useCase.execute({
      buffer: Buffer.from('vid'),
      mimeType: 'video/mp4',
    });

    expect(result).toEqual({ mediaUrl: 'https://cdn.example/huerta/clip.mp4' });
  });

  it('rejects an unsupported mime type', async () => {
    const storage = buildStorage();
    const useCase = new UploadHuertaMediaUseCase(storage);

    await expect(
      useCase.execute({ buffer: Buffer.from('x'), mimeType: 'application/pdf' }),
    ).rejects.toBeInstanceOf(InvalidHuertaMediaException);
    expect(storage.upload).not.toHaveBeenCalled();
  });

  it('rejects an image over the size cap', async () => {
    const storage = buildStorage();
    const useCase = new UploadHuertaMediaUseCase(storage);
    const oversized = Buffer.alloc(MAX_IMAGE_BYTES_OVER);

    await expect(
      useCase.execute({ buffer: oversized, mimeType: 'image/png' }),
    ).rejects.toBeInstanceOf(InvalidHuertaMediaException);
    expect(storage.upload).not.toHaveBeenCalled();
  });
});

const MAX_IMAGE_BYTES_OVER = 5 * 1024 * 1024 + 1;
