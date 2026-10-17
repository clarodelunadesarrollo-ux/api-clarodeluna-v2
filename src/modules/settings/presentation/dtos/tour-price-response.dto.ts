export interface TourPriceResponseProps {
  priceCents: number;
}

export class TourPriceResponseDto {
  readonly priceCents: number;

  constructor(props: TourPriceResponseProps) {
    this.priceCents = props.priceCents;
  }
}
