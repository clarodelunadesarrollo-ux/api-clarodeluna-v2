import { HttpStatus } from '@nestjs/common';

import { DomainException } from '../../../../common/exceptions/domain.exception';

/// Raised when an uploaded backup bundle is malformed (wrong shape, non-array
/// collections, etc.). Maps to 400 with a Spanish user message.
export class InvalidBackupException extends DomainException {
  constructor(reason: string, userMessage: string) {
    super(`Invalid backup bundle: ${reason}`, HttpStatus.BAD_REQUEST, userMessage);
  }
}
