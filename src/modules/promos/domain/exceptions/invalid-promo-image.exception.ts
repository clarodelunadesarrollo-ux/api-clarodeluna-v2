import { HttpStatus } from '@nestjs/common';

import { DomainException } from '../../../../common/exceptions/domain.exception';

export class InvalidPromoImageException extends DomainException {
  constructor(reason: string, userMessage: string) {
    super(`Invalid promo image: ${reason}`, HttpStatus.BAD_REQUEST, userMessage);
  }
}
