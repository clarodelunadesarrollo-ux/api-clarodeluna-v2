import { DomainException } from './domain.exception';

export class InvalidEmailException extends DomainException {
  constructor(message = 'The provided email has an invalid format') {
    super(message);
  }
}
