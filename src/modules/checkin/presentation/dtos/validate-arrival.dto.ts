import { IsString, Length, Matches } from 'class-validator';

export class ValidateArrivalDto {
  @IsString()
  @Length(4, 4)
  @Matches(/^\d{4}$/)
  readonly code!: string;
}
