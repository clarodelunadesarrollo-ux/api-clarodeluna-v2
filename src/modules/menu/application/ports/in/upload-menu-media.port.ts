export const UPLOAD_MENU_MEDIA_USE_CASE = Symbol('UPLOAD_MENU_MEDIA_USE_CASE');

export interface UploadMenuMediaCommand {
  buffer: Buffer;
  mimeType: string;
}

export interface UploadMenuMediaResult {
  imageUrl: string;
}

export interface UploadMenuMediaUseCasePort {
  execute(command: UploadMenuMediaCommand): Promise<UploadMenuMediaResult>;
}
