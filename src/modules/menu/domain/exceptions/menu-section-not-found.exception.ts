import { HttpStatus } from '@nestjs/common';

import { DomainException } from '../../../../common/exceptions/domain.exception';

export class MenuSectionNotFoundException extends DomainException {
  constructor() {
    super(
      'The requested menu section does not exist',
      HttpStatus.NOT_FOUND,
      'No encontramos esta sección de la carta.',
    );
  }
}
