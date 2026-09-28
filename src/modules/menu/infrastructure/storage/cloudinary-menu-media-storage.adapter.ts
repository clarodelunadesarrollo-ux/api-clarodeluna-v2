import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { v2 as cloudinary, UploadApiOptions, UploadApiResponse } from 'cloudinary';

import { parseCloudinaryUrl } from '../../../../common/cloudinary/parse-cloudinary-url';
import {
    MenuMediaStoragePort,
    UploadedMenuMedia,
    UploadMenuMediaInput,
} from '../../application/ports/out/menu-media-storage.port';

export interface CloudinaryMenuConfig {
  cloudName: string | undefined;
  apiKey: string | undefined;
  apiSecret: string | undefined;
  folder: string;
}

// Cloudinary-backed implementation of MenuMediaStoragePort. Dish images are
// uploaded privately with `type: 'authenticated'` so the raw asset is not
// publicly accessible; delivery happens through a signed URL. Credentials are
// read lazily so a missing configuration fails only when an upload is attempted
// (never at application boot).
@Injectable()
export class CloudinaryMenuMediaStorageAdapter implements MenuMediaStoragePort {
  private readonly logger = new Logger(CloudinaryMenuMediaStorageAdapter.name);
  private configured = false;

  constructor(private readonly config: CloudinaryMenuConfig) {}

  async upload(input: UploadMenuMediaInput): Promise<UploadedMenuMedia> {
    this.ensureConfigured();

    // `type: 'authenticated'` keeps the asset private: its raw URL is not
    // publicly accessible and can only be delivered through a signed URL.
    const options: UploadApiOptions = {
      folder: this.config.folder,
      resource_type: 'image',
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
      resource_type: 'image',
      type: 'authenticated',
      version: result.version,
      secure: true,
      sign_url: true,
      transformation: [{ quality: 'auto', fetch_format: 'auto' }],
    });

    return { url };
  }

  // Best-effort deletion: a failure to remove the remote asset (missing
  // credentials, unparsable URL, network error) is logged but never thrown, so
  // the dish deletion always succeeds even if the asset is left orphaned.
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
          message: 'Image upload is not configured on the server.',
          userMessage: 'El servicio de imágenes no está disponible.',
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
