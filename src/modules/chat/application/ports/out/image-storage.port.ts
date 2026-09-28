export const IMAGE_STORAGE = Symbol('IMAGE_STORAGE');

export interface UploadImageInput {
  buffer: Buffer;
  mimeType: string;
}

export interface UploadedImage {
  url: string;
}

// Abstracts the image hosting provider (Cloudinary) so use cases stay free of
// SDK details and can be tested with a fake.
export interface ImageStoragePort {
  upload(input: UploadImageInput): Promise<UploadedImage>;
}
