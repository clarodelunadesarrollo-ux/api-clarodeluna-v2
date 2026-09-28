import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { UploadApiOptions, UploadApiResponse, v2 as cloudinary } from 'cloudinary';

import { parseCloudinaryUrl } from '../../../../common/cloudinary/parse-cloudinary-url';
import {
    HuertaMediaStoragePort,
    UploadHuertaMediaInput,
    UploadedHuertaMedia,
} from '../../application/ports/out/huerta-media-storage.port';

export interface CloudinaryHuertaConfig {
  cloudName: string | undefined;
  apiKey: string | undefined;
  apiSecret: string | undefined;
  folder: string;
}

// Cloudinary-backed implementation of HuertaMediaStoragePort. Huerta media
// (images and videos) are uploaded privately with `type: 'authenticated'` so
// the raw asset is not publicly accessible; delivery happens through a signed
// URL. The Cloudinary resource type is derived from the mime type so videos are
// stored/transcoded correctly. Credentials are read lazily so a missing
// configuration fails only when an upload is attempted (never at boot).
@Injectable()
export class CloudinaryHuertaMediaStorageAdapter implements HuertaMediaStoragePort {
  private readonly logger = new Logger(CloudinaryHuertaMediaStorageAdapter.name);
  private configured = false;

  constructor(private readonly config: CloudinaryHuertaConfig) {}

  async upload(input: UploadHuertaMediaInput): Promise<UploadedHuertaMedia> {
    this.ensureConfigured();

    const resourceType = input.mimeType.startsWith('video/') ? 'video' : 'image';

    // `type: 'authenticated'` keeps the asset private: its raw URL is not
    // publicly accessible and can only be delivered through a signed URL.
    const options: UploadApiOptions = {
      folder: this.config.folder,
      resource_type: resourceType,
      type: 'authenticated',
    };

    const result = await new Promise<UploadApiResponse>((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        options,
        (error, uploaded) => {
          if (error || !uploaded) {
            reject(
              error instanceof Error
                ? error
                : new Error('Cloudinary upload failed'),
            );
            return;
          }
          resolve(uploaded);
        },
      );
      stream.end(input.buffer);
    });

    // Signed delivery URL for the private asset. Without an expiry it stays
    // stable, so it is safe to persist like the previous public URL while the
    // underlying asset remains inaccessible without this signature.
    const url = cloudinary.url(result.public_id, {
      resource_type: resourceType,
      type: 'authenticated',
      version: result.version,
      secure: true,
      sign_url: true,
    });

    return { url };
  }

  // Best-effort deletion: a failure to remove the remote asset (missing
  // credentials, unparsable URL, network error) is logged but never thrown, so
  // the item deletion always succeeds even if the asset is left orphaned.
  async delete(url: string): Promise<void> {
    const parsed = parseCloudinaryUrl(url);
    if (parsed === null) {
      return;
    }

    const { cloudName, apiKey, apiSecret } = this.config;
    if (!cloudName || !apiKey || !apiSecret) {
      this.logger.warn(
        'Skipping Cloudinary cleanup: credentials are not configured.',
      );
      return;
    }

    this.ensureConfigured();

    try {
      await cloudinary.uploader.destroy(parsed.publicId, {
        resource_type: parsed.resourceType,
        type: parsed.deliveryType,
        invalidate: true,
      });
    } catch (error) {
      this.logger.warn(
        `Failed to delete Cloudinary asset "${parsed.publicId}": ${String(error)}`,
      );
    }
  }

  private ensureConfigured(): void {
    const { cloudName, apiKey, apiSecret } = this.config;
    if (!cloudName || !apiKey || !apiSecret) {
      throw new HttpException(
        {
          message: 'Media upload is not configured on the server.',
          userMessage: 'El servicio de archivos no está disponible.',
        },
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }
    if (!this.configured) {
      cloudinary.config({
        cloud_name: cloudName,
        api_key: apiKey,
        api_secret: apiSecret,
        secure: true,
      });
      this.configured = true;
    }
  }
}
