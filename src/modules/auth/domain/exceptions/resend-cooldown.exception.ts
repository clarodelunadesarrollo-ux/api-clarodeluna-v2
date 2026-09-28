import { DomainException } from './domain.exception';

export class ResendCooldownException extends DomainException {
  constructor(message = 'The resend cooldown window is still active') {
    super(message);
  }
}
