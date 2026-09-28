import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { v2 as cloudinary, UploadApiOptions, UploadApiResponse } from 'cloudinary';

import {
    UploadedVrVideo,
    UploadVrVideoInput,
    VrVideoStoragePort,
} from '../../application/ports/out/vr-video-storage.port';

export interface CloudinaryVrConfig {
  cloudName: string | undefined;
  apiKey: string | undefined;
  apiSecret: string | undefined;
  folder: string;
}

// Cloudinary-backed implementation of VrVideoStoragePort. The VR video is
// uploaded privately with `type: 'authenticated'` so the raw asset is not
// publicly accessible; delivery happens through a stable signed URL.
// Credentials are read lazily so a missing configuration fails only when an
// upload is attempted (never at boot).
@Injectable()
export class CloudinaryVrVideoStorageAdapter implements VrVideoStoragePort {
  private configured = false;

  constructor(private readonly config: CloudinaryVrConfig) {}

  async upload(input: UploadVrVideoInput): Promise<UploadedVrVideo> {
    this.ensureConfigured();

    const options: UploadApiOptions = {
      folder: this.config.folder,
      resource_type: 'video',
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
    // stable, so it is safe to persist while the underlying asset remains
    // inaccessible without this signature.
    const url = cloudinary.url(result.public_id, {
      resource_type: 'video',
      type: 'authenticated',
      version: result.version,
      secure: true,
      sign_url: true,
    });

    return { url };
  }

  private ensureConfigured(): void {
    const { cloudName, apiKey, apiSecret } = this.config;
    if (!cloudName || !apiKey || !apiSecret) {
      throw new HttpException(
        {
          message: 'Video upload is not configured on the server.',
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
