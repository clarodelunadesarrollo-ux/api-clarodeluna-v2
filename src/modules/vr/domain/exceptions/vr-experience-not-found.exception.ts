import { HttpStatus } from '@nestjs/common';

import { DomainException } from '../../../../common/exceptions/domain.exception';

export class VrExperienceNotFoundException extends DomainException {
  constructor() {
    super(
      'VR experience has not been configured yet',
      HttpStatus.NOT_FOUND,
      'La experiencia VR todavía no está disponible.',
    );
  }
}
