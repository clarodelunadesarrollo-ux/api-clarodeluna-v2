import { HttpStatus } from '@nestjs/common';

import { DomainException } from '../../../../common/exceptions/domain.exception';

export class HuertaItemNotFoundException extends DomainException {
  constructor() {
    super(
      'The requested huerta item does not exist',
      HttpStatus.NOT_FOUND,
      'No encontramos este ítem de la huerta.',
    );
  }
}
