import { HttpStatus } from '@nestjs/common';

import { DomainException } from '../../../../common/exceptions/domain.exception';

export class ConversationNotFoundException extends DomainException {
  constructor() {
    super(
      'The requested conversation does not exist',
      HttpStatus.NOT_FOUND,
      'No encontramos esta conversación.',
    );
  }
}
