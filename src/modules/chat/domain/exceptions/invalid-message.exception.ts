import { HttpStatus } from '@nestjs/common';

import { DomainException } from '../../../../common/exceptions/domain.exception';

export class InvalidMessageException extends DomainException {
  constructor(reason: string, userMessage: string) {
    super(`Invalid message: ${reason}`, HttpStatus.BAD_REQUEST, userMessage);
  }
}
