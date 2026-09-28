import { HttpStatus } from '@nestjs/common';

import { DomainException } from '../../../../common/exceptions/domain.exception';

/**
 * Thrown when a reservation is attempted on a date the admin has blocked for
 * the requested type (or for both types).
 */
export class BlockedDateException extends DomainException {
  constructor() {
    super(
      'The selected date is blocked for reservations',
      HttpStatus.BAD_REQUEST,
      'La fecha seleccionada no está disponible para reservas.',
    );
  }
}
