export class UploadVrVideoResponseDto {
  readonly videoUrl: string;

  constructor(videoUrl: string) {
    this.videoUrl = videoUrl;
  }
}
