import { HttpStatus } from '@nestjs/common';

import { DomainException } from '../../../../common/exceptions/domain.exception';

export class InvalidPartySizeException extends DomainException {
  constructor() {
    super(
      'Party size must be between 1 and 8',
      HttpStatus.BAD_REQUEST,
      'La cantidad de personas debe ser entre 1 y 8.',
    );
  }
}
