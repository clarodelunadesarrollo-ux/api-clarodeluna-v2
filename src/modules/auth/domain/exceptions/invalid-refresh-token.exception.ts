import { DomainException } from './domain.exception';

export class InvalidRefreshTokenException extends DomainException {
  constructor(message = 'The refresh token is invalid or expired') {
    super(message);
  }
}
