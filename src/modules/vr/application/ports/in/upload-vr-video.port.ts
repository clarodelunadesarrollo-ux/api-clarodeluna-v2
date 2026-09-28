export const UPLOAD_VR_VIDEO_USE_CASE = Symbol('UPLOAD_VR_VIDEO_USE_CASE');

export interface UploadVrVideoCommand {
  buffer: Buffer;
  mimeType: string;
}

export interface UploadVrVideoResult {
  videoUrl: string;
}

export interface UploadVrVideoUseCasePort {
  execute(command: UploadVrVideoCommand): Promise<UploadVrVideoResult>;
}
