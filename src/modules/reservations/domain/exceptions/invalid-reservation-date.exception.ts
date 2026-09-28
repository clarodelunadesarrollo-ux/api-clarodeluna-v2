import { HttpStatus } from '@nestjs/common';

import { DomainException } from '../../../../common/exceptions/domain.exception';

export class InvalidReservationDateException extends DomainException {
  constructor() {
    super(
      'Reservation date is outside the allowed window',
      HttpStatus.BAD_REQUEST,
      'Elegí una fecha dentro de los próximos 30 días.',
    );
  }
}
