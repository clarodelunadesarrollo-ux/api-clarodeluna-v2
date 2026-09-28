export const VR_VIDEO_STORAGE = Symbol('VR_VIDEO_STORAGE');

export interface UploadVrVideoInput {
  buffer: Buffer;
  mimeType: string;
}

export interface UploadedVrVideo {
  url: string;
}

// Abstracts the video hosting provider (Cloudinary) for the VR experience so
// the use case stays free of SDK details and can be tested with a fake. The
// uploaded asset is delivered privately through a signed URL.
export interface VrVideoStoragePort {
  upload(input: UploadVrVideoInput): Promise<UploadedVrVideo>;
}
