import { HttpStatus } from '@nestjs/common';

import { DomainException } from '../../../../common/exceptions/domain.exception';

export class CheckinOutsideWindowException extends DomainException {
  constructor() {
    super(
      'The reservation is outside the allowed check-in window',
      HttpStatus.CONFLICT,
      'El check-in se habilita 30 minutos antes de tu reserva.',
    );
  }
}
