export const PROMO_IMAGE_STORAGE = Symbol('PROMO_IMAGE_STORAGE');

export interface UploadPromoImageInput {
  buffer: Buffer;
  mimeType: string;
}

export interface UploadedPromoImage {
  url: string;
}

// Abstracts the image hosting provider (Cloudinary) for promo cards so use
// cases stay free of SDK details and can be tested with a fake. Promo images
// are delivered privately through signed URLs.
export interface PromoImageStoragePort {
  upload(input: UploadPromoImageInput): Promise<UploadedPromoImage>;

  // Best-effort removal of a stored asset given its delivery URL. Must never
  // throw: cleanup failures should not block the card deletion.
  delete(url: string): Promise<void>;
}
