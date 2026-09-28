export const MENU_MEDIA_STORAGE = Symbol('MENU_MEDIA_STORAGE');

export interface UploadMenuMediaInput {
  buffer: Buffer;
  mimeType: string;
}

export interface UploadedMenuMedia {
  url: string;
}

// Abstracts the media hosting provider (Cloudinary) for menu dishes so use
// cases stay free of SDK details and can be tested with a fake. Dish images are
// delivered privately through signed URLs.
export interface MenuMediaStoragePort {
  upload(input: UploadMenuMediaInput): Promise<UploadedMenuMedia>;

  // Best-effort removal of a stored asset given its delivery URL. Must never
  // throw: cleanup failures should not block the dish deletion.
  delete(url: string): Promise<void>;
}
