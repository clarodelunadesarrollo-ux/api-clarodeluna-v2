import { HttpStatus } from '@nestjs/common';

import { DomainException } from '../../../../common/exceptions/domain.exception';

/**
 * Thrown when an admin submits an invalid schedule configuration: bad time
 * format, openTime not strictly before closeTime, or an interval that is not a
 * positive number of minutes fitting inside the window.
 */
export class InvalidScheduleException extends DomainException {
  constructor(
    userMessage = 'La configuración de horario no es válida.',
  ) {
    super(
      'The submitted schedule configuration is invalid',
      HttpStatus.BAD_REQUEST,
      userMessage,
    );
  }
}
