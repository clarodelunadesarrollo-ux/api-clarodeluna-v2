import { HttpStatus } from '@nestjs/common';

import { DomainException } from '../../../../common/exceptions/domain.exception';

/**
 * Thrown when creating a blackout for a date that already has one (dates are
 * unique).
 */
export class BlackoutAlreadyExistsException extends DomainException {
  constructor() {
    super(
      'A blackout already exists for the selected date',
      HttpStatus.CONFLICT,
      'Ya existe un bloqueo para la fecha seleccionada.',
    );
  }
}
