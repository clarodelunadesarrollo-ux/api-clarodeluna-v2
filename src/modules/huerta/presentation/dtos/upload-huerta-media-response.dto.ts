export class UploadHuertaMediaResponseDto {
  readonly mediaUrl: string;

  constructor(mediaUrl: string) {
    this.mediaUrl = mediaUrl;
  }
}
