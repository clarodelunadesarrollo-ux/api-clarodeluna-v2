import { HttpStatus } from '@nestjs/common';

import { DomainException } from '../../../../common/exceptions/domain.exception';

export class InvalidVrExperienceException extends DomainException {
  constructor(reason: string, userMessage: string) {
    super(
      `Invalid VR experience: ${reason}`,
      HttpStatus.UNPROCESSABLE_ENTITY,
      userMessage,
    );
  }
}
