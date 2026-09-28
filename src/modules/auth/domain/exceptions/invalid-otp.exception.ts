import { DomainException } from './domain.exception';

export class InvalidOtpException extends DomainException {
  constructor(message = 'The provided OTP does not match') {
    super(message);
  }
}
