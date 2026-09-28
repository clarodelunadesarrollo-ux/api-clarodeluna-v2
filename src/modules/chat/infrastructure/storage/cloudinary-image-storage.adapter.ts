import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import {
    UploadApiOptions,
    UploadApiResponse,
    v2 as cloudinary,
} from 'cloudinary';

import {
    ImageStoragePort,
    UploadImageInput,
    UploadedImage,
} from '../../application/ports/out/image-storage.port';

export interface CloudinaryConfig {
  cloudName: string | undefined;
  apiKey: string | undefined;
  apiSecret: string | undefined;
  folder: string;
}

// Cloudinary-backed implementation of ImageStoragePort. Credentials are read
// lazily so a missing configuration fails only when an upload is attempted
// (never at application boot).
@Injectable()
export class CloudinaryImageStorageAdapter implements ImageStoragePort {
  private configured = false;

  constructor(private readonly config: CloudinaryConfig) {}

  async upload(input: UploadImageInput): Promise<UploadedImage> {
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
