export const HUERTA_MEDIA_STORAGE = Symbol('HUERTA_MEDIA_STORAGE');

export interface UploadHuertaMediaInput {
  buffer: Buffer;
  mimeType: string;
}

export interface UploadedHuertaMedia {
  url: string;
}

// Abstracts the media hosting provider (Cloudinary) for huerta items so use
// cases stay free of SDK details and can be tested with a fake. Huerta media
// (images and videos) are delivered privately through signed URLs.
export interface HuertaMediaStoragePort {
  upload(input: UploadHuertaMediaInput): Promise<UploadedHuertaMedia>;

  // Best-effort removal of a stored asset given its delivery URL. Must never
  // throw: cleanup failures should not block the item deletion.
  delete(url: string): Promise<void>;
}
