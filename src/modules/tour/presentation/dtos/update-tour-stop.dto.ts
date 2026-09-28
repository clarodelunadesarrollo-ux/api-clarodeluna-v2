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

export class UpdateTourStopDto {
  @IsOptional()
  @IsInt()
  @Min(1)
  readonly order?: number;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  readonly title?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  readonly description?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(1)
  readonly positionX?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(1)
  readonly positionY?: number;

  @IsOptional()
  @IsBoolean()
  readonly active?: boolean;
}
