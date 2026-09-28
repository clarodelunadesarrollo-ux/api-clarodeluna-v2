import { HttpStatus } from '@nestjs/common';

import { DomainException } from '../../../../common/exceptions/domain.exception';

export class NoEligibleReservationException extends DomainException {
  constructor() {
    super(
      'The user has no active reservation eligible for check-in',
      HttpStatus.NOT_FOUND,
      'No tenés una reserva activa para registrar tu llegada.',
    );
  }
}
