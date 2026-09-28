import { HttpStatus } from '@nestjs/common';

import { DomainException } from '../../../../common/exceptions/domain.exception';

export class InvalidHuertaItemException extends DomainException {
  constructor(reason: string, userMessage: string) {
    super(`Invalid huerta item: ${reason}`, HttpStatus.UNPROCESSABLE_ENTITY, userMessage);
  }
}
