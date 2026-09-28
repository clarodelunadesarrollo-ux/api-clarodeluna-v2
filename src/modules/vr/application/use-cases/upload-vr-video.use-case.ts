import { InvalidVrExperienceException } from '../../domain/exceptions/invalid-vr-experience.exception';
import {
    UploadVrVideoCommand,
    UploadVrVideoResult,
    UploadVrVideoUseCasePort,
} from '../ports/in/upload-vr-video.port';
import { VrVideoStoragePort } from '../ports/out/vr-video-storage.port';

// The VR video is streamed to guests, so uploads are validated against a small
// allowlist of web-friendly video formats with a size cap before being
// delegated to the storage adapter.
const ALLOWED_VIDEO_MIME_TYPES = ['video/mp4', 'video/webm', 'video/quicktime'];
const MAX_VIDEO_BYTES = 100 * 1024 * 1024;

export class UploadVrVideoUseCase implements UploadVrVideoUseCasePort {
  constructor(private readonly storage: VrVideoStoragePort) {}

  async execute(command: UploadVrVideoCommand): Promise<UploadVrVideoResult> {
    if (!ALLOWED_VIDEO_MIME_TYPES.includes(command.mimeType)) {
      throw new InvalidVrExperienceException(
        `unsupported mime type "${command.mimeType}"`,
        'El archivo debe ser un video (MP4, WEBM o MOV).',
      );
    }

    if (command.buffer.length > MAX_VIDEO_BYTES) {
      throw new InvalidVrExperienceException(
        `file exceeds ${MAX_VIDEO_BYTES} bytes`,
        'El video supera el tamaño máximo permitido (100 MB).',
      );
    }

    const { url } = await this.storage.upload({
      buffer: command.buffer,
      mimeType: command.mimeType,
    });

    return { videoUrl: url };
  }
}
