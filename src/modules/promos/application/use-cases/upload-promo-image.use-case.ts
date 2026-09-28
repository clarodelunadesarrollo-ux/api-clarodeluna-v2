import { InvalidPromoImageException } from '../../domain/exceptions/invalid-promo-image.exception';
import {
    UploadPromoImageCommand,
    UploadPromoImageResult,
    UploadPromoImageUseCasePort,
} from '../ports/in/upload-promo-image.port';
import { PromoImageStoragePort } from '../ports/out/promo-image-storage.port';

// Guests can see promo images, so uploads are validated against a small
// allowlist of web-friendly formats and a reasonable size cap before being
// delegated to the storage adapter.
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

export class UploadPromoImageUseCase implements UploadPromoImageUseCasePort {
  constructor(private readonly storage: PromoImageStoragePort) {}

  async execute(
    command: UploadPromoImageCommand,
  ): Promise<UploadPromoImageResult> {
    if (!ALLOWED_MIME_TYPES.includes(command.mimeType)) {
      throw new InvalidPromoImageException(
        `unsupported mime type "${command.mimeType}"`,
        'El archivo debe ser una imagen JPG, PNG, WEBP o GIF.',
      );
    }
    if (command.buffer.length > MAX_IMAGE_BYTES) {
      throw new InvalidPromoImageException(
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
