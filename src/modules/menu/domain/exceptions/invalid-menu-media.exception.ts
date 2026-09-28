import { HttpStatus } from '@nestjs/common';

import { DomainException } from '../../../../common/exceptions/domain.exception';

export class InvalidMenuMediaException extends DomainException {
  constructor(reason: string, userMessage: string) {
    super(`Invalid menu media: ${reason}`, HttpStatus.BAD_REQUEST, userMessage);
  }
}
