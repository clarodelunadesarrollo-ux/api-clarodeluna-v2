import { HttpStatus } from '@nestjs/common';

import { DomainException } from '../../../../common/exceptions/domain.exception';

/** Thrown when deleting a blackout that does not exist. */
export class BlackoutNotFoundException extends DomainException {
  constructor() {
    super(
      'The requested blackout was not found',
      HttpStatus.NOT_FOUND,
      'El bloqueo solicitado no existe.',
    );
  }
}
