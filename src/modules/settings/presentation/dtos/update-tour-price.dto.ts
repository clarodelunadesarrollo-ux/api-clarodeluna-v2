import { IsInt, Min } from 'class-validator';

export class UpdateTourPriceDto {
  @IsInt()
  @Min(0)
  readonly priceCents!: number;
}
