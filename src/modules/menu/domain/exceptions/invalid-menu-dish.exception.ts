import { HttpStatus } from '@nestjs/common';

import { DomainException } from '../../../../common/exceptions/domain.exception';

export class InvalidMenuDishException extends DomainException {
  constructor(reason: string, userMessage: string) {
    super(`Invalid menu dish: ${reason}`, HttpStatus.UNPROCESSABLE_ENTITY, userMessage);
  }
}
