import { HttpStatus } from '@nestjs/common';

import { DomainException } from '../../../../common/exceptions/domain.exception';

export class InvalidMenuSectionException extends DomainException {
  constructor(reason: string, userMessage: string) {
    super(`Invalid menu section: ${reason}`, HttpStatus.UNPROCESSABLE_ENTITY, userMessage);
  }
}
