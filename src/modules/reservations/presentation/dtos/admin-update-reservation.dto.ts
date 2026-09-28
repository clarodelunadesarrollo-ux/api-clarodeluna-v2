import {
    IsDateString,
    IsEnum,
    IsInt,
    IsOptional,
    Matches,
    Max,
    Min,
} from 'class-validator';

import { ReservationStatus } from '../../domain/enums/reservation-status.enum';

const TIME_PATTERN = /^([01]\d|2[0-3]):[0-5]\d$/;

export class AdminUpdateReservationDto {
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

  @IsOptional()
  @IsEnum(ReservationStatus)
  readonly status?: ReservationStatus;
}
