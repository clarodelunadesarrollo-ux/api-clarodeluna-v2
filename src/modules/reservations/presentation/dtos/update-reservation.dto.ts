import { IsDateString, IsInt, IsOptional, Matches, Max, Min } from 'class-validator';

const TIME_PATTERN = /^([01]\d|2[0-3]):[0-5]\d$/;

export class UpdateReservationDto {
  @IsOptional()
  @IsDateString()
  readonly date?: string;

  @IsOptional()
  @Matches(TIME_PATTERN, { message: 'time must be in HH:mm format' })
  readonly time?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(8)
  readonly partySize?: number;
}
