import { HttpStatus } from '@nestjs/common';

import { DomainException } from '../../../../common/exceptions/domain.exception';

export class InvalidTimeSlotException extends DomainException {
  constructor() {
    super(
      'The selected time is not available for this reservation type',
      HttpStatus.BAD_REQUEST,
      'El horario elegido no está disponible.',
    );
  }
}
