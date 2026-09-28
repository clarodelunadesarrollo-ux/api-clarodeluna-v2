import { HttpStatus } from '@nestjs/common';

import { DomainException } from '../../../../common/exceptions/domain.exception';

export class TourStopNotFoundException extends DomainException {
  constructor() {
    super(
      'The requested tour stop does not exist',
      HttpStatus.NOT_FOUND,
      'No encontramos esta parada del recorrido.',
    );
  }
}
