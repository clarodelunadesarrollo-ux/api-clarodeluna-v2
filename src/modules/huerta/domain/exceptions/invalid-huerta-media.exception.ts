import { HttpStatus } from '@nestjs/common';

import { DomainException } from '../../../../common/exceptions/domain.exception';

export class InvalidHuertaMediaException extends DomainException {
  constructor(reason: string, userMessage: string) {
    super(`Invalid huerta media: ${reason}`, HttpStatus.BAD_REQUEST, userMessage);
  }
}
