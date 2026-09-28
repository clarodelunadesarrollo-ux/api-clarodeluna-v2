import { HttpStatus } from '@nestjs/common';

import { DomainException } from '../../../../common/exceptions/domain.exception';

export class TourLimitReachedException extends DomainException {
  constructor() {
    super(
      'The user already has the maximum number of active tour reservations',
      HttpStatus.CONFLICT,
      'Ya tenés 2 reservas de tour. Solo podés reservar en el restaurante.',
    );
  }
}
