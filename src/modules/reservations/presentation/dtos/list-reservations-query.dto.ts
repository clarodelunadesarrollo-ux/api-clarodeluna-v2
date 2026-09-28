import { IsEnum, IsOptional } from 'class-validator';

import { ReservationStatus } from '../../domain/enums/reservation-status.enum';
import { ReservationType } from '../../domain/enums/reservation-type.enum';

export class ListReservationsQueryDto {
  @IsOptional()
  @IsEnum(ReservationType)
  readonly type?: ReservationType;

  @IsOptional()
  @IsEnum(ReservationStatus)
  readonly status?: ReservationStatus;
}
