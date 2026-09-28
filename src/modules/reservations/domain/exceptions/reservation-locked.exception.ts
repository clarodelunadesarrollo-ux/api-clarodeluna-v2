import { HttpStatus } from '@nestjs/common';

import { DomainException } from '../../../../common/exceptions/domain.exception';

export class ReservationLockedException extends DomainException {
  constructor() {
    super(
      'The reservation already has a check-in and cannot be modified',
      HttpStatus.CONFLICT,
      'La reserva ya tiene check-in y no se puede modificar.',
    );
  }
}
