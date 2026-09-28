import { HttpStatus } from '@nestjs/common';

import { DomainException } from '../../../../common/exceptions/domain.exception';

export class InvalidCheckinCodeException extends DomainException {
  constructor() {
    super(
      'The check-in code is invalid or has expired',
      HttpStatus.UNPROCESSABLE_ENTITY,
      'El código no es válido o expiró. Escaneá el código nuevamente.',
    );
  }
}
