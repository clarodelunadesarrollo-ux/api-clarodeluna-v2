import { IsDateString, IsEnum, IsInt, Matches, Max, Min } from 'class-validator';

import { ReservationType } from '../../domain/enums/reservation-type.enum';

const TIME_PATTERN = /^([01]\d|2[0-3]):[0-5]\d$/;

export class CreateReservationDto {
  @IsEnum(ReservationType)
  readonly type!: ReservationType;

  @IsDateString()
  readonly date!: string;

  @Matches(TIME_PATTERN, { message: 'time must be in HH:mm format' })
  readonly time!: string;

  @IsInt()
  @Min(1)
  @Max(8)
  readonly partySize!: number;
}
