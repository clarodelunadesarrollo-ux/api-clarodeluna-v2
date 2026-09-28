import { DomainException } from './domain.exception';

export class OtpExpiredException extends DomainException {
  constructor(message = 'The OTP has expired') {
    super(message);
  }
}
