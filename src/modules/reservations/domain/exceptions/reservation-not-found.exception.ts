import { HttpStatus } from '@nestjs/common';

import { DomainException } from '../../../../common/exceptions/domain.exception';

export class ReservationNotFoundException extends DomainException {
  constructor() {
    super(
      'Reservation not found',
      HttpStatus.NOT_FOUND,
      'No encontramos la reserva.',
    );
  }
}
