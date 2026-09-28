import { InvalidHuertaMediaException } from '../../domain/exceptions/invalid-huerta-media.exception';
import {
    UploadHuertaMediaCommand,
    UploadHuertaMediaResult,
    UploadHuertaMediaUseCasePort,
} from '../ports/in/upload-huerta-media.port';
import { HuertaMediaStoragePort } from '../ports/out/huerta-media-storage.port';

// Huerta media are shown to guests, so uploads are validated against small
// allowlists of web-friendly image and video formats, with a per-type size cap
// (videos are heavier), before being delegated to the storage adapter.
const ALLOWED_IMAGE_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const ALLOWED_VIDEO_MIME_TYPES = ['video/mp4', 'video/webm', 'video/quicktime'];
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const MAX_VIDEO_BYTES = 100 * 1024 * 1024;

export class UploadHuertaMediaUseCase implements UploadHuertaMediaUseCasePort {
  constructor(private readonly storage: HuertaMediaStoragePort) {}

  async execute(
    command: UploadHuertaMediaCommand,
  ): Promise<UploadHuertaMediaResult> {
    const isImage = ALLOWED_IMAGE_MIME_TYPES.includes(command.mimeType);
    const isVideo = ALLOWED_VIDEO_MIME_TYPES.includes(command.mimeType);

    if (!isImage && !isVideo) {
      throw new InvalidHuertaMediaException(
        `unsupported mime type "${command.mimeType}"`,
        'El archivo debe ser una imagen (JPG, PNG, WEBP, GIF) o un video (MP4, WEBM, MOV).',
      );
    }

    const maxBytes = isVideo ? MAX_VIDEO_BYTES : MAX_IMAGE_BYTES;
    if (command.buffer.length > maxBytes) {
      const limitLabel = isVideo ? '100 MB' : '5 MB';
      throw new InvalidHuertaMediaException(
        `file exceeds ${maxBytes} bytes`,
        `El archivo supera el tamaño máximo permitido (${limitLabel}).`,
      );
    }

    const uploaded = await this.storage.upload({
      buffer: command.buffer,
      mimeType: command.mimeType,
    });

    return { mediaUrl: uploaded.url };
  }
}
