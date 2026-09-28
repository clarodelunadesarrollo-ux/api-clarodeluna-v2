import { InvalidMenuMediaException } from '../../domain/exceptions/invalid-menu-media.exception';
import {
    UploadMenuMediaCommand,
    UploadMenuMediaResult,
    UploadMenuMediaUseCasePort,
} from '../ports/in/upload-menu-media.port';
import { MenuMediaStoragePort } from '../ports/out/menu-media-storage.port';

// Dish images are shown to guests, so uploads are validated against a small
// allowlist of web-friendly image formats with a size cap before being
// delegated to the storage adapter.
const ALLOWED_IMAGE_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

export class UploadMenuMediaUseCase implements UploadMenuMediaUseCasePort {
  constructor(private readonly storage: MenuMediaStoragePort) {}

  async execute(command: UploadMenuMediaCommand): Promise<UploadMenuMediaResult> {
    if (!ALLOWED_IMAGE_MIME_TYPES.includes(command.mimeType)) {
      throw new InvalidMenuMediaException(
        `unsupported mime type "${command.mimeType}"`,
        'El archivo debe ser una imagen (JPG, PNG, WEBP, GIF).',
      );
    }

    if (command.buffer.length > MAX_IMAGE_BYTES) {
      throw new InvalidMenuMediaException(
        `file exceeds ${MAX_IMAGE_BYTES} bytes`,
        'La imagen supera el tamaño máximo permitido (5 MB).',
      );
    }

    const uploaded = await this.storage.upload({
      buffer: command.buffer,
      mimeType: command.mimeType,
    });

    return { imageUrl: uploaded.url };
  }
}
