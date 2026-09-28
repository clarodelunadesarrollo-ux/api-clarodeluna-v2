import { DomainException } from './domain.exception';

export class OtpAttemptsExhaustedException extends DomainException {
  constructor(message = 'The OTP validation attempts have been exhausted') {
    super(message);
  }
}
