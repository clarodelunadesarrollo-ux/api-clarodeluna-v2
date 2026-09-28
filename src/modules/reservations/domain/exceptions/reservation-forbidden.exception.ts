import { HttpStatus } from '@nestjs/common';

import { DomainException } from '../../../../common/exceptions/domain.exception';

export class ReservationForbiddenException extends DomainException {
  constructor() {
    super(
      'The reservation does not belong to the current user',
      HttpStatus.FORBIDDEN,
      'No podés acceder a esta reserva.',
    );
  }
}
