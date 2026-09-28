export class UploadPromoImageResponseDto {
  readonly imageUrl: string;

  constructor(imageUrl: string) {
    this.imageUrl = imageUrl;
  }
}
