export const UPLOAD_HUERTA_MEDIA_USE_CASE = Symbol('UPLOAD_HUERTA_MEDIA_USE_CASE');

export interface UploadHuertaMediaCommand {
  buffer: Buffer;
  mimeType: string;
}

export interface UploadHuertaMediaResult {
  mediaUrl: string;
}

export interface UploadHuertaMediaUseCasePort {
  execute(command: UploadHuertaMediaCommand): Promise<UploadHuertaMediaResult>;
}
