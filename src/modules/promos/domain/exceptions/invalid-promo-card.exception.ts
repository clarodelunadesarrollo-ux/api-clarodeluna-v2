import { HttpStatus } from '@nestjs/common';

import { DomainException } from '../../../../common/exceptions/domain.exception';

export class InvalidPromoCardException extends DomainException {
  constructor(reason: string, userMessage: string) {
    super(`Invalid promo card: ${reason}`, HttpStatus.UNPROCESSABLE_ENTITY, userMessage);
  }
}
