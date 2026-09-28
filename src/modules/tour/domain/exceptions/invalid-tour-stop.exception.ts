import { HttpStatus } from '@nestjs/common';

import { DomainException } from '../../../../common/exceptions/domain.exception';

export class InvalidTourStopException extends DomainException {
  constructor(reason: string, userMessage: string) {
    super(`Invalid tour stop: ${reason}`, HttpStatus.UNPROCESSABLE_ENTITY, userMessage);
  }
}
