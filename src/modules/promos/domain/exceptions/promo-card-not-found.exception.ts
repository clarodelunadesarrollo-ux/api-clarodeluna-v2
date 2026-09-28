import { HttpStatus } from '@nestjs/common';

import { DomainException } from '../../../../common/exceptions/domain.exception';

export class PromoCardNotFoundException extends DomainException {
  constructor() {
    super(
      'The requested promo card does not exist',
      HttpStatus.NOT_FOUND,
      'No encontramos esta tarjeta.',
    );
  }
}
