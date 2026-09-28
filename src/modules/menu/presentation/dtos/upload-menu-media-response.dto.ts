export class UploadMenuMediaResponseDto {
  readonly imageUrl: string;

  constructor(imageUrl: string) {
    this.imageUrl = imageUrl;
  }
}
