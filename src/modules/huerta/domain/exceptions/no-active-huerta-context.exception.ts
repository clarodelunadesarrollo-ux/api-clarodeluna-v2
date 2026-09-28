import { HttpStatus } from '@nestjs/common';

import { DomainException } from '../../../../common/exceptions/domain.exception';

export class NoActiveHuertaContextException extends DomainException {
  constructor() {
    super(
      'The user has no checked-in reservation today to access the huerta',
      HttpStatus.FORBIDDEN,
      'Necesitás registrar tu llegada para ver la huerta.',
    );
  }
}
