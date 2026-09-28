import {
    IsBoolean,
    IsInt,
    IsNotEmpty,
    IsNumber,
    IsOptional,
    IsString,
    Max,
    Min,
} from 'class-validator';

export class CreateTourStopDto {
  @IsInt()
  @Min(1)
  readonly order!: number;

  @IsString()
  @IsNotEmpty()
  readonly title!: string;

  @IsString()
  @IsNotEmpty()
  readonly description!: string;

  @IsNumber()
  @Min(0)
  @Max(1)
  readonly positionX!: number;

  @IsNumber()
  @Min(0)
  @Max(1)
  readonly positionY!: number;

  @IsOptional()
  @IsBoolean()
  readonly active?: boolean;
}
