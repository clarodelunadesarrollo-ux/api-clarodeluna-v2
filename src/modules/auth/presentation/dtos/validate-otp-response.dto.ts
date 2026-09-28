import { TokenPair } from '../../application/ports/out/token-generator.port';

/**
 * `data` payload for POST /auth/otp/validate. Field names are the exact
 * camelCase keys the Flutter client parses.
 */
export class ValidateOtpResponseDto {
  readonly accessToken: string;
  readonly refreshToken: string;
  readonly tokenType: string;

  constructor(tokens: TokenPair) {
    this.accessToken = tokens.accessToken;
    this.refreshToken = tokens.refreshToken;
    this.tokenType = 'Bearer';
  }
}
