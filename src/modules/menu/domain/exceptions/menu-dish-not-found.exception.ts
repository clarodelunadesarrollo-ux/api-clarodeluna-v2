import { HttpStatus } from '@nestjs/common';

import { DomainException } from '../../../../common/exceptions/domain.exception';

export class MenuDishNotFoundException extends DomainException {
  constructor() {
    super(
      'The requested menu dish does not exist',
      HttpStatus.NOT_FOUND,
      'No encontramos este plato de la carta.',
    );
  }
}
