import { HttpStatus } from '@nestjs/common';

import { DomainException } from '../../../../common/exceptions/domain.exception';

export class NoActiveMenuContextException extends DomainException {
  constructor() {
    super(
      'The user has no checked-in reservation today to resolve a menu context',
      HttpStatus.FORBIDDEN,
      'Necesitás registrar tu llegada para ver la carta.',
    );
  }
}
