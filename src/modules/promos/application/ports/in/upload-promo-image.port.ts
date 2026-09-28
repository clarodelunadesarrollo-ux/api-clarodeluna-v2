export const UPLOAD_PROMO_IMAGE_USE_CASE = Symbol('UPLOAD_PROMO_IMAGE_USE_CASE');

export interface UploadPromoImageCommand {
  buffer: Buffer;
  mimeType: string;
}

export interface UploadPromoImageResult {
  imageUrl: string;
}

export interface UploadPromoImageUseCasePort {
  execute(command: UploadPromoImageCommand): Promise<UploadPromoImageResult>;
}
